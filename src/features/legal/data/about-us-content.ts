export interface AboutUsSection {
  title: string;
  content: string[];
}

export const ABOUT_US_DATA = {
  title: 'About Wingmall',
  subtitle:
    "Wingmall is Cambodia's online shopping and fast express delivery platform, built to make everyday shopping and delivery fast, convenient, and enjoyable.",
  sections: [
    {
      title: 'What We Offer',
      content: [
        'We partner with over 1,000 well-known merchants across Cambodia to bring you a wide and ever-growing selection of products.',
        "Whether you're stocking up on groceries, craving your favorite food and drinks, upgrading your electronics, picking up toys for the kids, or refreshing your beauty routine, Wingmall brings it all together on one trusted platform.",
      ],
    },
    {
      title: 'Fast, Reliable Delivery',
      content: [
        'We know that when you order something, you want it quickly. That is why we work with trusted logistics partners to operate a fast, dependable delivery network that gets your orders to you with minimal wait — so you can spend less time waiting and more time enjoying what you ordered.',
        'With WingExpress, sellers enjoy fast pickup, live multi-stop dispatch, and guaranteed zero-deduction Cash on Delivery (COD) collection.',
      ],
    },
    {
      title: 'A Rewarding Shopping Experience',
      content: [
        'Shopping with Wingmall comes with more than just convenience. Earn Wingpoints on your purchases, redeem gift cards, and enjoy exclusive promotions and deals from our merchant partners.',
        'With secure payment options powered by Wing Bank, KHQR integration, and real-time order tracking, you can shop with confidence from start to finish.',
      ],
    },
    {
      title: 'Shop Anytime, Anywhere',
      content: [
        'Take Wingmall with you wherever you go — download the app on Google Play or the App Store for a seamless shopping experience on the move, or book and shop directly from our website at your convenience.',
      ],
    },
    {
      title: 'Our Commitment',
      content: [
        'At Wingmall, our mission is simple: to connect you with the products you love from the merchants you trust, delivered reliably through our logistics network.',
        'As we continue to grow, we remain committed to expanding our merchant network, strengthening our delivery capabilities, and making online commerce in Cambodia easier for everyone.',
      ],
    },
  ],
  contact: {
    title: 'Get in Touch',
    description:
      "We're here to help with any questions about your orders, our merchants, or your Wingmall experience.",
    phone: '(+855) 78 311 311',
    phoneRaw: '+85578311311',
    address:
      '#721, Preah Monivong Blvd, Sangkat Boeung Keng Kang III, Khan Boeung Keng Kang, Phnom Penh, Kingdom of Cambodia',
    mapsUrl: 'https://maps.app.goo.gl/nwLSJfAwY1uHydXp8',
  },
};

