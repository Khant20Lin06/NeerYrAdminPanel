import { createBrowserRouter } from 'react-router-dom';

// project imports
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import BrandRoutes from '../pages/brand/BrandRoutes';
import BusinessRoutes from '../pages/business/BusinessRoutes';
import BusinessImageRoutes from '../pages/business-image/BusinessImageRoutes';
import CategoryRoutes from '../pages/category/CategoryRoutes';
import PromotionRoutes from '../pages/promotion/PromotionRoutes';
import ReviewRoutes from '../pages/review/ReviewRoutes';
import AdminReviewRoutes from '../pages/admin/review/AdminReviewRoutes';
import SubscriptionRoutes from '../pages/subscription/SubscriptionRoutes';
import CommentRoutes from '../pages/comment/CommentRoutes';
import AdminCommentRoutes from '../pages/admin/comment/AdminCommentRoutes';
import PaymentAccountsRoutes from '../pages/paymentAccount/PaymentAccountsRoutes';
import AdminPaymentAccountsRoutes from '../pages/admin/paymentAccount/AdminPaymentAccountsRoutes';
import AdminWalletsRoutes from '../pages/admin/points/AdminWalletsRoutes';
import AdminUserRoutes from '../pages/admin/users/AdminUserRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([MainRoutes, LoginRoutes, BrandRoutes, BusinessRoutes, BusinessImageRoutes, CategoryRoutes, PromotionRoutes, ReviewRoutes, AdminReviewRoutes, SubscriptionRoutes, CommentRoutes, AdminCommentRoutes, PaymentAccountsRoutes, AdminPaymentAccountsRoutes, AdminWalletsRoutes, AdminUserRoutes ], { basename: import.meta.env.VITE_APP_BASE_NAME });

export default router;
