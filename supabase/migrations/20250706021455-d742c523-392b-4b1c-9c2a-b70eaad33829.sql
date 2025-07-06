-- Update the xPub key with the real one provided by user
UPDATE public.system_config 
SET config_value = 'zpub6mdMNbQ7gECJaLuUNo3s2xKpvLWh7eSABZ2JwAbGd93LKGrsVk6BHhx6QpiKzwaecSwBL3PZuyhyRkLxwKq159niQFvRtEhSigCsZqSaAXb'
WHERE config_key = 'xpub_master';