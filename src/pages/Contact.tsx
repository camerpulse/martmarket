import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle, Shield, Mail, Clock, Globe, Bitcoin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    urgency: 'normal'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send to a secure contact system
    toast({
      title: t('contact.success.title', 'Message Sent'),
      description: t('contact.success.description', 'Your secure message has been received. We will respond within 24 hours.'),
    });
    setFormData({ subject: '', message: '', urgency: 'normal' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <MessageCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">
              {t('contact.title', 'Contact OpesMarket')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('contact.subtitle', 'Get in touch with our team for support, questions, or partnership inquiries. All communications are encrypted and secure.')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>{t('contact.form.title', 'Secure Contact Form')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      {t('contact.form.subject', 'Subject')}
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={t('contact.form.subject_placeholder', 'Brief description of your inquiry')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">
                      {t('contact.form.urgency', 'Priority Level')}
                    </Label>
                    <select
                      id="urgency"
                      value={formData.urgency}
                      onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                      className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md"
                    >
                      <option value="low">{t('contact.form.urgency.low', 'Low - General inquiry')}</option>
                      <option value="normal">{t('contact.form.urgency.normal', 'Normal - Standard support')}</option>
                      <option value="high">{t('contact.form.urgency.high', 'High - Technical issue')}</option>
                      <option value="urgent">{t('contact.form.urgency.urgent', 'Urgent - Security concern')}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      {t('contact.form.message', 'Message')}
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t('contact.form.message_placeholder', 'Please provide detailed information about your inquiry or issue...')}
                      className="min-h-[120px]"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    {t('contact.form.send', 'Send Secure Message')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Response Times */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{t('contact.response.title', 'Response Times')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('contact.response.general', 'General Inquiries')}</span>
                    <span className="text-sm font-medium text-muted-foreground">24-48 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('contact.response.technical', 'Technical Support')}</span>
                    <span className="text-sm font-medium text-muted-foreground">12-24 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('contact.response.security', 'Security Issues')}</span>
                    <span className="text-sm font-medium text-trust-high">2-6 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t('contact.response.urgent', 'Urgent Matters')}</span>
                    <span className="text-sm font-medium text-destructive">1-2 hours</span>
                  </div>
                </CardContent>
              </Card>

              {/* Support Topics */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('contact.topics.title', 'Common Topics')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Bitcoin className="h-4 w-4 text-primary" />
                    <span className="text-sm">{t('contact.topics.payments', 'Bitcoin Payment Issues')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-verified" />
                    <span className="text-sm">{t('contact.topics.vendor', 'Vendor Verification')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-4 w-4 text-secondary" />
                    <span className="text-sm">{t('contact.topics.disputes', 'Order Disputes')}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4 text-info" />
                    <span className="text-sm">{t('contact.topics.technical', 'Technical Support')}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Security Notice */}
              <Card className="border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-primary mb-2">
                        {t('contact.security.title', 'Security Notice')}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t('contact.security.description', 'All communications are encrypted end-to-end. We never ask for passwords, private keys, or sensitive information via support channels.')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Contact;