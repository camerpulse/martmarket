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
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { action, file_data, file_name, max_size_kb = 10 } = await req.json();
    
    console.log(`File Optimizer: ${action} for ${file_name}`);

    if (action === 'optimize_image') {
      // Convert base64 to binary
      const binaryData = Uint8Array.from(atob(file_data), c => c.charCodeAt(0));
      const originalSize = binaryData.length;
      
      // Mock optimization logic - In production, use proper image processing library
      const optimizedData = await optimizeImageToWebP(binaryData, max_size_kb * 1024);
      const optimizedSize = optimizedData.length;
      
      // Calculate compression ratio
      const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;
      
      // Generate file paths
      const timestamp = Date.now();
      const originalPath = `uploads/original/${timestamp}_${file_name}`;
      const optimizedPath = `uploads/optimized/${timestamp}_${file_name.replace(/\.[^/.]+$/, '.webp')}`;
      
      // Store optimization record
      const { data: optimizationRecord, error: recordError } = await supabaseAdmin
        .from('file_optimizations')
        .insert({
          original_file_path: originalPath,
          optimized_file_path: optimizedPath,
          original_size_bytes: originalSize,
          optimized_size_bytes: optimizedSize,
          compression_ratio: compressionRatio,
          format_converted_from: getFileExtension(file_name),
          format_converted_to: 'webp',
          optimization_status: 'completed'
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // Convert optimized data back to base64 for response
      const optimizedBase64 = btoa(String.fromCharCode(...optimizedData));
      
      return new Response(
        JSON.stringify({
          success: true,
          original_size: originalSize,
          optimized_size: optimizedSize,
          compression_ratio: compressionRatio.toFixed(2),
          optimized_data: optimizedBase64,
          optimized_path: optimizedPath,
          optimization_id: optimizationRecord.id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'batch_optimize') {
      const { files } = await req.json();
      const results = [];
      
      for (const file of files) {
        try {
          // Process each file individually
          const binaryData = Uint8Array.from(atob(file.data), c => c.charCodeAt(0));
          const originalSize = binaryData.length;
          
          const optimizedData = await optimizeImageToWebP(binaryData, max_size_kb * 1024);
          const optimizedSize = optimizedData.length;
          const compressionRatio = ((originalSize - optimizedSize) / originalSize) * 100;
          
          const timestamp = Date.now();
          const optimizedPath = `uploads/optimized/${timestamp}_${file.name.replace(/\.[^/.]+$/, '.webp')}`;
          
          // Store optimization record
          await supabaseAdmin
            .from('file_optimizations')
            .insert({
              original_file_path: `uploads/original/${timestamp}_${file.name}`,
              optimized_file_path: optimizedPath,
              original_size_bytes: originalSize,
              optimized_size_bytes: optimizedSize,
              compression_ratio: compressionRatio,
              format_converted_from: getFileExtension(file.name),
              format_converted_to: 'webp',
              optimization_status: 'completed'
            });

          results.push({
            file_name: file.name,
            success: true,
            original_size: originalSize,
            optimized_size: optimizedSize,
            compression_ratio: compressionRatio.toFixed(2),
            optimized_path: optimizedPath,
            optimized_data: btoa(String.fromCharCode(...optimizedData))
          });
        } catch (error) {
          results.push({
            file_name: file.name,
            success: false,
            error: error.message
          });
        }
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          results: results,
          total_processed: files.length,
          successful: results.filter(r => r.success).length
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );

    } else if (action === 'get_optimization_stats') {
      // Get optimization statistics
      const { data: stats, error: statsError } = await supabaseAdmin
        .from('file_optimizations')
        .select('*')
        .eq('optimization_status', 'completed');

      if (statsError) throw statsError;

      const totalOriginalSize = stats?.reduce((sum, record) => sum + record.original_size_bytes, 0) || 0;
      const totalOptimizedSize = stats?.reduce((sum, record) => sum + record.optimized_size_bytes, 0) || 0;
      const totalSavings = totalOriginalSize - totalOptimizedSize;
      const averageCompression = stats?.length > 0 ? 
        stats.reduce((sum, record) => sum + (record.compression_ratio || 0), 0) / stats.length : 0;

      return new Response(
        JSON.stringify({
          success: true,
          total_files_optimized: stats?.length || 0,
          total_original_size_bytes: totalOriginalSize,
          total_optimized_size_bytes: totalOptimizedSize,
          total_savings_bytes: totalSavings,
          total_savings_mb: (totalSavings / (1024 * 1024)).toFixed(2),
          average_compression_ratio: averageCompression.toFixed(2)
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    throw new Error('Invalid action specified');

  } catch (error) {
    console.error('File Optimizer Error:', error);
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

// Helper functions
async function optimizeImageToWebP(imageData: Uint8Array, maxSizeBytes: number): Promise<Uint8Array> {
  // Mock optimization - In production, use proper image processing library
  // This simulates compression by reducing the data size
  
  let compressionQuality = 0.8;
  let optimizedSize = Math.floor(imageData.length * compressionQuality);
  
  // Iteratively reduce quality until we're under the max size
  while (optimizedSize > maxSizeBytes && compressionQuality > 0.1) {
    compressionQuality -= 0.1;
    optimizedSize = Math.floor(imageData.length * compressionQuality);
  }
  
  // Simulate compressed data (in reality, this would be proper WebP conversion)
  const optimizedData = new Uint8Array(optimizedSize);
  for (let i = 0; i < optimizedSize; i++) {
    optimizedData[i] = imageData[i % imageData.length];
  }
  
  return optimizedData;
}

function getFileExtension(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension || 'unknown';
}