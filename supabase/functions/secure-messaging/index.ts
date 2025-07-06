import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error('User authentication required');
    }

    const { action, ...params } = await req.json();
    console.log(`Secure Messaging: ${action} for user ${user.id}`);

    if (action === 'create_thread') {
      const { order_id, participant_id, subject } = params;

      // Get order details to determine buyer/vendor roles
      const { data: order, error: orderError } = await supabaseAdmin
        .from('orders')
        .select('buyer_id, vendor_id')
        .eq('id', order_id)
        .single();

      if (orderError || !order) {
        throw new Error('Order not found');
      }

      // Determine roles
      const isBuyer = order.buyer_id === user.id;
      const isVendor = order.vendor_id === user.id;

      if (!isBuyer && !isVendor) {
        throw new Error('Not authorized for this order');
      }

      // Check if thread already exists
      const { data: existingThread } = await supabaseAdmin
        .from('message_threads')
        .select('id')
        .eq('order_id', order_id)
        .single();

      if (existingThread) {
        return new Response(
          JSON.stringify({
            success: true,
            thread_id: existingThread.id,
            message: 'Thread already exists'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      // Create new thread
      const { data: thread, error: threadError } = await supabaseAdmin
        .from('message_threads')
        .insert({
          order_id: order_id,
          buyer_id: order.buyer_id,
          vendor_id: order.vendor_id,
          subject: subject || `Order Discussion - ${order_id}`
        })
        .select()
        .single();

      if (threadError) throw threadError;

      // Log security event
      await logSecurityEvent(supabaseAdmin, user.id, 'message_thread_created', {
        thread_id: thread.id,
        order_id: order_id
      }, req);

      return new Response(
        JSON.stringify({
          success: true,
          thread_id: thread.id,
          thread: thread
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'send_message') {
      const { thread_id, content, message_type = 'text', encrypt = true } = params;

      // Verify user has access to thread
      const { data: thread, error: threadError } = await supabaseAdmin
        .from('message_threads')
        .select('*')
        .eq('id', thread_id)
        .single();

      if (threadError || !thread) {
        throw new Error('Thread not found');
      }

      if (thread.buyer_id !== user.id && thread.vendor_id !== user.id) {
        throw new Error('Not authorized for this thread');
      }

      // Determine recipient
      const recipient_id = thread.buyer_id === user.id ? thread.vendor_id : thread.buyer_id;

      // Encrypt message if required
      let finalContent = content;
      if (encrypt && thread.is_encrypted) {
        // In production, integrate with PGP encryption function
        try {
          const { data: encryptResult, error: encryptError } = await supabaseAdmin.functions.invoke('pgp-encryption', {
            body: {
              action: 'encrypt_message',
              message: content,
              recipient_id: recipient_id
            }
          });
          
          if (encryptError) {
            console.warn('PGP encryption failed, sending plaintext:', encryptError);
          } else if (encryptResult?.success) {
            finalContent = encryptResult.encrypted_message;
          }
        } catch (error) {
          console.warn('PGP encryption unavailable, sending plaintext:', error);
        }
      }

      // Insert message
      const { data: message, error: messageError } = await supabaseAdmin
        .from('messages')
        .insert({
          thread_id: thread_id,
          sender_id: user.id,
          recipient_id: recipient_id,
          content: finalContent,
          message_type: message_type,
          order_id: thread.order_id
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Log security event
      await logSecurityEvent(supabaseAdmin, user.id, 'secure_message_sent', {
        thread_id: thread_id,
        message_id: message.id,
        encrypted: encrypt && thread.is_encrypted
      }, req);

      return new Response(
        JSON.stringify({
          success: true,
          message: message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'mark_as_read') {
      const { thread_id } = params;

      // Use the SQL function to mark thread as read
      const { error: readError } = await supabaseAdmin
        .rpc('mark_thread_as_read', {
          thread_id_param: thread_id,
          user_id_param: user.id
        });

      if (readError) throw readError;

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Thread marked as read'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'set_typing') {
      const { thread_id, is_typing = true } = params;

      // Verify access to thread
      const { data: thread } = await supabaseAdmin
        .from('message_threads')
        .select('buyer_id, vendor_id')
        .eq('id', thread_id)
        .single();

      if (!thread || (thread.buyer_id !== user.id && thread.vendor_id !== user.id)) {
        throw new Error('Not authorized for this thread');
      }

      // Upsert typing indicator
      const { error: typingError } = await supabaseAdmin
        .from('typing_indicators')
        .upsert({
          thread_id: thread_id,
          user_id: user.id,
          is_typing: is_typing,
          updated_at: new Date().toISOString()
        });

      if (typingError) throw typingError;

      // Auto-clear typing indicator after 5 seconds
      if (is_typing) {
        setTimeout(async () => {
          await supabaseAdmin
            .from('typing_indicators')
            .update({ is_typing: false })
            .eq('thread_id', thread_id)
            .eq('user_id', user.id);
        }, 5000);
      }

      return new Response(
        JSON.stringify({
          success: true,
          is_typing: is_typing
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'add_reaction') {
      const { message_id, reaction_type } = params;

      // Verify user has access to the message
      const { data: message } = await supabaseAdmin
        .from('messages')
        .select(`
          *,
          message_threads!inner(buyer_id, vendor_id)
        `)
        .eq('id', message_id)
        .single();

      if (!message || 
          (message.message_threads.buyer_id !== user.id && 
           message.message_threads.vendor_id !== user.id)) {
        throw new Error('Message not found or access denied');
      }

      // Upsert reaction
      const { data: reaction, error: reactionError } = await supabaseAdmin
        .from('message_reactions')
        .upsert({
          message_id: message_id,
          user_id: user.id,
          reaction_type: reaction_type
        })
        .select()
        .single();

      if (reactionError) throw reactionError;

      return new Response(
        JSON.stringify({
          success: true,
          reaction: reaction
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'get_threads') {
      // Get user's message threads
      const { data: threads, error: threadsError } = await supabaseAdmin
        .from('message_threads')
        .select(`
          *,
          orders(id, status, products(title)),
          buyer_profile:profiles!message_threads_buyer_id_fkey(display_name),
          vendor_profile:profiles!message_threads_vendor_id_fkey(display_name)
        `)
        .or(`buyer_id.eq.${user.id},vendor_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })
        .limit(50);

      if (threadsError) throw threadsError;

      return new Response(
        JSON.stringify({
          success: true,
          threads: threads || []
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'get_messages') {
      const { thread_id, limit = 50, offset = 0 } = params;

      // Verify access to thread
      const { data: thread } = await supabaseAdmin
        .from('message_threads')
        .select('buyer_id, vendor_id, is_encrypted')
        .eq('id', thread_id)
        .single();

      if (!thread || (thread.buyer_id !== user.id && thread.vendor_id !== user.id)) {
        throw new Error('Thread not found or access denied');
      }

      // Get messages with reactions
      const { data: messages, error: messagesError } = await supabaseAdmin
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(display_name),
          reactions:message_reactions(reaction_type, user_id),
          attachments:message_attachments(*)
        `)
        .eq('thread_id', thread_id)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (messagesError) throw messagesError;

      return new Response(
        JSON.stringify({
          success: true,
          messages: messages || [],
          is_encrypted: thread.is_encrypted
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('Secure Messaging Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper function to log security events
async function logSecurityEvent(supabase: any, userId: string, eventType: string, eventData: any, req: Request) {
  try {
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    
    await supabase
      .from('security_events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_level: 'info',
        ip_address: clientIP,
        user_agent: req.headers.get('user-agent'),
        event_data: eventData,
        threat_score: 0.0
      });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
}