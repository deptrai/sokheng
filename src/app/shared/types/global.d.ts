type LoginCredentials = { email: string; password: string };
type LoginResponse = { exp: number; token: string; user: any };

type I18N = "en" | "vi" | "km";

// UserData type is now defined in src/types/user.d.ts with full Customer fields

interface BannerInfo {
  title: string;
  deliveryTime: string;
  address: string;
  workingHours: WorkingHours;
}

interface CartInfo extends BannerInfo {
  deliveryPrice: number;
}

type PaginationMeta = {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
};

interface RestaurantWithDishesInfo {
  dishes: any[];
  // isDelivery: boolean;
  timestamp?: number;
}

type AddressData = {
  city?: string | null;
  district: string;
  houseNumber: string;
  apartment: string;
  entrance?: string | null;
  id?: string | null;
};

type City = { id: string; title: string };

type CategoryTypes = "dish" | "restaurant";

type OrderStatus = "pending" | "recieved" | "sended" | "delivered" | "rejected";

type FeedbackType = "cooperation" | "feedback";
interface FeedbackOrCoop {
  name?: string;
  phoneNumber?: string;
  description: string;
  type: FeedbackType;
}

interface FeedbackOrCoopResponse {
  id: string;
  type: FeedbackType;
}

type ToastTypes = "error" | "success" | "warning" | "info";

type SortTypes = {
  title: string;
  value: SortBy;
};