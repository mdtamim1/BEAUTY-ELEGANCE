export function convertToBengaliDigits(numStr: string): string {
  if (!numStr) return '';
  const englishToBengali: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return numStr.split('').map(char => englishToBengali[char] || char).join('');
}

export function replaceContactInfo(text: string, contactInfo: { phoneNumber: string; whatsappNumber: string; email: string; messengerUrl: string }): string {
  if (!text || !contactInfo) return text;
  
  const formattedPhone = contactInfo.phoneNumber || '';
  const formattedPhoneBengali = convertToBengaliDigits(formattedPhone);
  
  const formattedWhatsapp = contactInfo.whatsappNumber || '';
  const formattedWhatsappBengali = convertToBengaliDigits(formattedWhatsapp);

  const email = contactInfo.email || '';

  let result = text;
  
  // Replace Bengali phone number placeholders/hardcoded instances
  result = result.replace(/০১৭০০০০০০০০/g, formattedPhoneBengali || '০১৭০০০০০০০০');
  result = result.replace(/01700000000/g, formattedPhone || '01700000000');
  
  // Replace WhatsApp instances
  result = result.replace(/\+৮৮০১৭০০০০০০০০/g, formattedWhatsappBengali ? ('+' + formattedWhatsappBengali) : '+৮৮০১৭০০০০০০০০');
  result = result.replace(/8801700000000/g, formattedWhatsapp || '8801700000000');
  result = result.replace(/\+8801700000000/g, formattedWhatsapp ? ('+' + formattedWhatsapp) : '+8801700000000');
  
  // Replace emails
  result = result.replace(/support@vipcommerce\.com/g, email || 'support@vipcommerce.com');
  
  return result;
}
