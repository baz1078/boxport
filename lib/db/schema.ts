import {
  pgTable,
  text,
  integer,
  boolean,
  numeric,
  timestamp,
  primaryKey,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";

// ─── Auth.js Required Tables ────────────────────────────────────────────────

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ─── BoxPort Core Tables ─────────────────────────────────────────────────────

export const userProfiles = pgTable("user_profiles", {
  id: text("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["buyer", "seller", "admin"] })
    .notNull()
    .default("buyer"),
  fullName: text("full_name").notNull().default(""),
  businessName: text("business_name"),
  phone: text("phone"),
  city: text("city"),
  state: text("state"),
  zip: text("zip"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  stripeAccountId: text("stripe_account_id"),
  stripeAccountStatus: text("stripe_account_status", {
    enum: ["pending", "active", "restricted"],
  }),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionTier: text("subscription_tier", { enum: ["free", "pro"] })
    .notNull()
    .default("free"),
  subscriptionId: text("subscription_id"),
  subscriptionStatus: text("subscription_status"),
  listingsCount: integer("listings_count").notNull().default(0),
  isProfileComplete: boolean("is_profile_complete").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const listings = pgTable(
  "listings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerId: text("seller_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").unique().notNull(),
    containerType: text("container_type", {
      enum: [
        "20ft",
        "40ft",
        "40ft_high_cube",
        "reefer",
        "open_top",
        "flat_rack",
        "tank",
      ],
    }).notNull(),
    condition: text("condition", {
      enum: ["one_trip", "cargo_worthy", "wind_water_tight", "as_is"],
    }).notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    allowOffers: boolean("allow_offers").notNull().default(true),
    buyNowEnabled: boolean("buy_now_enabled").notNull().default(true),
    description: text("description"),
    city: text("city").notNull(),
    state: text("state").notNull(),
    zip: text("zip").notNull(),
    lat: numeric("lat", { precision: 9, scale: 6 }),
    lng: numeric("lng", { precision: 9, scale: 6 }),
    status: text("status", {
      enum: ["draft", "active", "pending", "sold", "paused"],
    })
      .notNull()
      .default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    featuredUntil: timestamp("featured_until"),
    viewCount: integer("view_count").notNull().default(0),
    inquiryCount: integer("inquiry_count").notNull().default(0),
    yearManufactured: integer("year_manufactured"),
    weightCapacityLbs: integer("weight_capacity_lbs"),
    conditionNotes: text("condition_notes"),
    soldAt: timestamp("sold_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_listings_status").on(table.status),
    index("idx_listings_seller_id").on(table.sellerId),
    index("idx_listings_container_type").on(table.containerType),
    index("idx_listings_condition").on(table.condition),
    index("idx_listings_state").on(table.state),
    index("idx_listings_created_at").on(table.createdAt),
  ]
);

export const listingImages = pgTable("listing_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  key: text("key").notNull(), // uploadthing file key
  position: integer("position").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  buyerId: text("buyer_id").references(() => userProfiles.id),
  buyerEmail: text("buyer_email").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerPhone: text("buyer_phone"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  message: text("message"),
  status: text("status", {
    enum: [
      "pending",
      "accepted",
      "declined",
      "countered",
      "expired",
      "withdrawn",
      "checkout_initiated",
    ],
  })
    .notNull()
    .default("pending"),
  round: integer("round").notNull().default(1),
  parentOfferId: uuid("parent_offer_id"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id),
  offerId: uuid("offer_id").references(() => offers.id),
  buyerEmail: text("buyer_email").notNull(),
  buyerId: text("buyer_id").references(() => userProfiles.id),
  sellerId: text("seller_id")
    .notNull()
    .references(() => userProfiles.id),
  grossAmount: numeric("gross_amount", { precision: 12, scale: 2 }).notNull(),
  platformFee: numeric("platform_fee", { precision: 12, scale: 2 }).notNull(),
  sellerPayout: numeric("seller_payout", {
    precision: 12,
    scale: 2,
  }).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique().notNull(),
  stripeTransferId: text("stripe_transfer_id"),
  stripeChargeId: text("stripe_charge_id"),
  status: text("status", {
    enum: [
      "held",
      "captured",
      "transferred",
      "disputed",
      "refunded",
      "released",
    ],
  })
    .notNull()
    .default("held"),
  paymentMethodLast4: text("payment_method_last4"),
  captureDeadline: timestamp("capture_deadline").notNull(),
  buyerConfirmedAt: timestamp("buyer_confirmed_at"),
  autoReleasedAt: timestamp("auto_released_at"),
  disputedAt: timestamp("disputed_at"),
  disputeReason: text("dispute_reason"),
  disputeResolvedAt: timestamp("dispute_resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id")
    .unique()
    .notNull()
    .references(() => transactions.id),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id),
  reviewerEmail: text("reviewer_email").notNull(),
  reviewerId: text("reviewer_id").references(() => userProfiles.id),
  sellerId: text("seller_id")
    .notNull()
    .references(() => userProfiles.id),
  rating: integer("rating").notNull(),
  title: text("title"),
  body: text("body"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const featuredBoosts = pgTable("featured_boosts", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id")
    .notNull()
    .references(() => listings.id),
  sellerId: text("seller_id")
    .notNull()
    .references(() => userProfiles.id),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique().notNull(),
  amountPaid: numeric("amount_paid", { precision: 6, scale: 2 })
    .notNull()
    .default("9.99"),
  startsAt: timestamp("starts_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const listingsRelations = relations(listings, ({ many }) => ({
  images: many(listingImages),
  offers: many(offers),
  transactions: many(transactions),
  reviews: many(reviews),
}));

export const listingImagesRelations = relations(listingImages, ({ one }) => ({
  listing: one(listings, {
    fields: [listingImages.listingId],
    references: [listings.id],
  }),
}));

export const offersRelations = relations(offers, ({ one, many }) => ({
  listing: one(listings, {
    fields: [offers.listingId],
    references: [listings.id],
  }),
  counterOffers: many(offers, { relationName: "counterChain" }),
  parentOffer: one(offers, {
    fields: [offers.parentOfferId],
    references: [offers.id],
    relationName: "counterChain",
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  listing: one(listings, {
    fields: [transactions.listingId],
    references: [listings.id],
  }),
  offer: one(offers, {
    fields: [transactions.offerId],
    references: [offers.id],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  listings: many(listings),
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(userProfiles, {
    fields: [notifications.userId],
    references: [userProfiles.id],
  }),
}));

// ─── Types ───────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type Listing = typeof listings.$inferSelect;
export type ListingImage = typeof listingImages.$inferSelect;
export type Offer = typeof offers.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
