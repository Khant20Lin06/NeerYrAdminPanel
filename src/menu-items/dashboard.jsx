// assets
import {
  DashboardOutlined,
  ShopOutlined,
  AppstoreOutlined,
  TagsOutlined,
  PictureOutlined,
  CommentOutlined,
  StarOutlined,
  GiftOutlined,
  CreditCardOutlined,
  WalletOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  ShopOutlined,
  AppstoreOutlined,
  TagsOutlined,
  PictureOutlined,
  CommentOutlined,
  StarOutlined,
  GiftOutlined,
  CreditCardOutlined,
  WalletOutlined,
  UserOutlined,
  TeamOutlined
};


// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'branch',
      title: 'Branch',
      type: 'item',
      url: '/brands/list',
      icon: icons.ShopOutlined
    },
    {
      id: 'business',
      title: 'Business',
      type: 'item',
      url: '/businesses/list',
      icon: icons.AppstoreOutlined
    },
    {
      id: 'business-image',
      title: 'BusinessImage',
      type: 'item',
      url: '/business-images/list',
      icon: icons.PictureOutlined
    },
    {
      id: 'category',
      title: 'ShopCategory',
      type: 'item',
      url: '/categories/list',
      icon: icons.TagsOutlined
    },
    {
      id: 'promotion',
      title: 'Promotion',
      type: 'item',
      url: '/promotions/list',
      icon: icons.GiftOutlined
    },
    {
      id: 'review',
      title: 'Review',
      type: 'item',
      url: '/reviews/me',
      icon: icons.StarOutlined
    },
    {
      id: 'admin-review',
      title: 'AdminReview',
      type: 'item',
      url: '/admin/reviews',
      icon: icons.StarOutlined
    },
    {
      id: 'subscription',
      title: 'Subscription',
      type: 'item',
      url: '/subscriptions/list',
      icon: icons.CreditCardOutlined
    },
    {
      id: 'comments',
      title: 'Comments',
      type: 'item',
      url: '/comments/create',
      icon: icons.CommentOutlined
    },
    {
      id: 'admin-comments',
      title: 'AdminComments',
      type: 'item',
      url: '/admin/comments',
      icon: icons.CommentOutlined
    },
    {
      id: 'payment-accounts',
      title: 'PaymentAccounts',
      type: 'item',
      url: '/payment-accounts',
      icon: icons.CreditCardOutlined
    },
    {
      id: 'admin-payment-accounts',
      title: 'AdminPaymentAccounts',
      type: 'item',
      url: '/admin/payment-accounts',
      icon: icons.CreditCardOutlined
    },
    {
      id: 'admin-wallet',
      title: 'AdminWallet',
      type: 'item',
      url: '/admin/wallet',
      icon: icons.WalletOutlined
    },
    {
      id: 'admin-user',
      title: 'AdminUser',
      type: 'item',
      url: '/admin/users',
      icon: icons.TeamOutlined
    }
  ]
};


export default dashboard;
