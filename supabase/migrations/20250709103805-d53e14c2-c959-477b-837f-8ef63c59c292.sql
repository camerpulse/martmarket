-- Add missing translations for Contact page and other missing keys
INSERT INTO public.translations (language_code, translation_key, translation_value, context) VALUES

-- Contact page translations for all languages
('en', 'contact.title', 'Contact OpesMarket', 'contact'),
('en', 'contact.subtitle', 'Get in touch with our team for support, questions, or partnership inquiries. All communications are encrypted and secure.', 'contact'),
('en', 'contact.success.title', 'Message Sent', 'contact'),
('en', 'contact.success.description', 'Your secure message has been received. We will respond within 24 hours.', 'contact'),
('en', 'shop.filters.price_range', 'Price Range (BTC)', 'shop'),

-- Spanish
('es', 'contact.title', 'Contactar OpesMarket', 'contact'),
('es', 'contact.subtitle', 'Ponte en contacto con nuestro equipo para soporte, preguntas o consultas de asociación. Todas las comunicaciones están cifradas y son seguras.', 'contact'),
('es', 'contact.success.title', 'Mensaje Enviado', 'contact'),
('es', 'contact.success.description', 'Su mensaje seguro ha sido recibido. Responderemos dentro de 24 horas.', 'contact'),
('es', 'shop.filters.price_range', 'Rango de Precio (BTC)', 'shop'),

-- French
('fr', 'contact.title', 'Contacter OpesMarket', 'contact'),
('fr', 'contact.subtitle', 'Contactez notre équipe pour le support, les questions ou les demandes de partenariat. Toutes les communications sont chiffrées et sécurisées.', 'contact'),
('fr', 'contact.success.title', 'Message Envoyé', 'contact'),
('fr', 'contact.success.description', 'Votre message sécurisé a été reçu. Nous répondrons dans les 24 heures.', 'contact'),
('fr', 'shop.filters.price_range', 'Gamme de Prix (BTC)', 'shop'),

-- German
('de', 'contact.title', 'OpesMarket Kontaktieren', 'contact'),
('de', 'contact.subtitle', 'Kontaktieren Sie unser Team für Support, Fragen oder Partnerschaftsanfragen. Alle Kommunikationen sind verschlüsselt und sicher.', 'contact'),
('de', 'contact.success.title', 'Nachricht Gesendet', 'contact'),
('de', 'contact.success.description', 'Ihre sichere Nachricht wurde empfangen. Wir werden innerhalb von 24 Stunden antworten.', 'contact'),
('de', 'shop.filters.price_range', 'Preisbereich (BTC)', 'shop'),

-- Italian
('it', 'contact.title', 'Contatta OpesMarket', 'contact'),
('it', 'contact.subtitle', 'Mettiti in contatto con il nostro team per supporto, domande o richieste di partnership. Tutte le comunicazioni sono criptate e sicure.', 'contact'),
('it', 'contact.success.title', 'Messaggio Inviato', 'contact'),
('it', 'contact.success.description', 'Il tuo messaggio sicuro è stato ricevuto. Risponderemo entro 24 ore.', 'contact'),
('it', 'shop.filters.price_range', 'Fascia di Prezzo (BTC)', 'shop'),

-- Portuguese
('pt', 'contact.title', 'Contatar OpesMarket', 'contact'),
('pt', 'contact.subtitle', 'Entre em contato com nossa equipe para suporte, perguntas ou consultas de parceria. Todas as comunicações são criptografadas e seguras.', 'contact'),
('pt', 'contact.success.title', 'Mensagem Enviada', 'contact'),
('pt', 'contact.success.description', 'Sua mensagem segura foi recebida. Responderemos dentro de 24 horas.', 'contact'),
('pt', 'shop.filters.price_range', 'Faixa de Preço (BTC)', 'shop'),

-- Russian
('ru', 'contact.title', 'Связаться с OpesMarket', 'contact'),
('ru', 'contact.subtitle', 'Свяжитесь с нашей командой для поддержки, вопросов или запросов о партнерстве. Все коммуникации зашифрованы и безопасны.', 'contact'),
('ru', 'contact.success.title', 'Сообщение Отправлено', 'contact'),
('ru', 'contact.success.description', 'Ваше защищенное сообщение получено. Мы ответим в течение 24 часов.', 'contact'),
('ru', 'shop.filters.price_range', 'Диапазон Цен (BTC)', 'shop'),

-- Chinese
('zh', 'contact.title', '联系OpesMarket', 'contact'),
('zh', 'contact.subtitle', '联系我们的团队获取支持、问题或合作咨询。所有通信都经过加密且安全。', 'contact'),
('zh', 'contact.success.title', '消息已发送', 'contact'),
('zh', 'contact.success.description', '您的安全消息已收到。我们将在24小时内回复。', 'contact'),
('zh', 'shop.filters.price_range', '价格范围 (BTC)', 'shop'),

-- Japanese
('ja', 'contact.title', 'OpesMarketにお問い合わせ', 'contact'),
('ja', 'contact.subtitle', 'サポート、質問、パートナーシップのお問い合わせについて、私たちのチームにご連絡ください。すべての通信は暗号化され安全です。', 'contact'),
('ja', 'contact.success.title', 'メッセージ送信完了', 'contact'),
('ja', 'contact.success.description', 'セキュアなメッセージを受信しました。24時間以内に返信いたします。', 'contact'),
('ja', 'shop.filters.price_range', '価格帯 (BTC)', 'shop'),

-- Korean
('ko', 'contact.title', 'OpesMarket 연락하기', 'contact'),
('ko', 'contact.subtitle', '지원, 질문 또는 파트너십 문의를 위해 저희 팀에 연락하세요. 모든 통신은 암호화되어 안전합니다.', 'contact'),
('ko', 'contact.success.title', '메시지 전송됨', 'contact'),
('ko', 'contact.success.description', '보안 메시지가 수신되었습니다. 24시간 내에 응답하겠습니다.', 'contact'),
('ko', 'shop.filters.price_range', '가격 범위 (BTC)', 'shop')

ON CONFLICT (language_code, translation_key, context) DO NOTHING;