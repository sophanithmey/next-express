export interface PrivacySection {
  number?: string;
  title: string;
  paragraphs: string[];
}

export const PRIVACY_DATA = {
  title: 'Privacy Policy',
  documentTitle: 'WINGMALL PRIVACY POLICY',
  lastUpdated: '15 September, 2026',
  importantNotice:
    'IT IS IMPORTANT THAT YOU READ CAREFULLY AND UNDERSTAND THE FOLLOWING DATA PRIVACY POLICY OF WING BEFORE YOU DECIDE TO DISCLOSE ANY DATA TO WING.',
  introduction: [
    'Wing Market Co., Ltd. ("Wing," "we," "us," or "our") understands that your privacy is important. We respect your privacy and are committed to protecting it through our compliance with this Privacy Policy.',
    'This Privacy Policy explains how Wing collects, manages, and protects your data when you interact with Wingmall and WingExpress.',
    'By accessing or using the Wingmall Website and services, you acknowledge and agree to the practices described in this Privacy Policy.',
  ],
  sections: [
    {
      title: 'What Information Do We Collect?',
      paragraphs: [
        'Personal Information: We collect certain information that you voluntarily provide to us, including your name, billing address, shipping and pickup addresses, phone number, and email address when you register an account or book deliveries.',
        'Device Information: When you visit the Wingmall Website, our system automatically collects certain data about your device, including web browser details, IP address, time zone, and cookies installed on your device.',
        'Financial & Payment Data: We collect transaction and payment references necessary to process orders, dispatch couriers, and disburse Cash on Delivery (COD) proceeds.',
        'Location & Geolocation Data: To provide accurate delivery dispatch, map pinning, and distance-based delivery fees, we collect GPS coordinates when you choose to use map-based location features.',
      ],
    },
    {
      title: 'How We Collect Your Data',
      paragraphs: [
        'Direct Interactions: We collect data when you fill out forms, register your account, select pickup and drop-off destinations, or contact our customer support team.',
        'Automated Technologies: As you navigate through the platform, cookies, server logs, and browser storage collect technical information to maintain your session and preferences.',
      ],
    },
    {
      title: 'How We Use Your Information',
      paragraphs: [
        'To create and manage your user account.',
        'To process delivery bookings, optimize courier routes, and facilitate recipient drop-offs.',
        'To handle payments, generate KHQR dynamic codes, and disburse COD funds.',
        'To communicate dispatch updates, delivery status notifications, and customer support responses.',
        'To protect against fraudulent activities, unauthorized access, and system misuse.',
      ],
    },
    {
      title: 'How We Share Your Information',
      paragraphs: [
        'With Delivery Riders & Couriers: We share recipient names, phone numbers, delivery notes, and destination coordinates with authorized couriers exclusively to fulfill deliveries.',
        'With Corporate Affiliates: We share data with our parent entity Wing Bank (Cambodia) Plc. and related entities to provide integrated banking and payment services.',
        'Legal Obligations: We may disclose data when required by applicable laws of the Kingdom of Cambodia or in response to lawful regulatory requests.',
      ],
    },
    {
      title: 'Security of Your Information',
      paragraphs: [
        'We use administrative, technical, and physical security measures to protect your personal information against unauthorized access, loss, or misuse.',
        'Sensitive payment credentials and session tokens are encrypted using secure protocols and are never stored in plain text.',
      ],
    },
    {
      title: 'Children’s Privacy',
      paragraphs: [
        'We do not knowingly solicit information from or market to children under the legal age without parental or guardian authorization.',
      ],
    },
    {
      title: 'Governing Law and Dispute Resolution',
      paragraphs: [
        'This Privacy Policy is governed by, and construed in accordance with, the laws of the Kingdom of Cambodia.',
        'Any dispute arising from this policy shall be resolved through friendly consultations or submitted to the competent courts of Cambodia.',
      ],
    },
    {
      title: 'Contact Us',
      paragraphs: [
        'For questions, data access requests, or inquiries regarding this Privacy Policy, please contact: Wing Market Co., Ltd., Tel: +855 78 311 311, Address: No. 721, Preah Monivong Blvd, Sangkat Boeung Keng Kang III, Khan Boeung Keng Kang, Phnom Penh, Kingdom of Cambodia.',
      ],
    },
  ],
};

