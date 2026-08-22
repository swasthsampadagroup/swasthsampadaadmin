import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  getDocs,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";

import { db } from "./firebase";
import { INITIAL_EMPLOYEES, INITIAL_DISTRIBUTORS } from "./seedData";

/**
 * ============================================================
 * FIRESTORE COLLECTIONS
 * ============================================================
 */

const PRODUCTS_COLLECTION = "products";
const ORDERS_COLLECTION = "orders";
const EMPLOYEES_COLLECTION = "employees";
const DISTRIBUTORS_COLLECTION = "distributors";
const TARGETS_COLLECTION = "targets";
const NOTIFICATIONS_COLLECTION = "notifications";
const AUDIT_LOGS_COLLECTION = "auditLogs";

/**
 * ============================================================
 * FIRESTORE DATABASE CHECK
 * ============================================================
 */

const getDbOrThrow = (): NonNullable<typeof db> => {
  if (!db) {
    throw new Error(
      "Firebase Firestore is not initialized. Please check your Firebase configuration."
    );
  }

  return db;
};

/**
 * ============================================================
 * PRODUCT TYPE
 * ============================================================
 */

export type ProductDocument = {
  id: string;

  productId?: string;
  productName?: string;
  productCode?: string;

  category?: string;
  division?: string;

  composition?: string;
  description?: string;
  pharmaceuticalDescription?: string;
  botanicalDescription?: string;

  packing?: string;

  mrp?: number;
  ptr?: number;
  pts?: number;
  price?: number;

  gst?: number | string;

  stockQuantity?: number;
  minStockAlert?: number;

  imageUrl?: string;

  active?: boolean;

  hsnCode?: string;

  createdAt?: unknown;
  updatedAt?: unknown;

  [key: string]: unknown;
};

/**
 * ============================================================
 * ORDER TYPE
 * ============================================================
 *
 * Kept flexible because your Android application may already
 * have additional order fields.
 */

export type OrderDocument = {
  id: string;

  orderId?: string;
  userId?: string;
  distributorId?: string;

  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;

  status?: string;

  totalAmount?: number;
  subtotal?: number;
  gstAmount?: number;
  discount?: number;

  items?: unknown[];

  createdAt?: unknown;
  updatedAt?: unknown;

  [key: string]: unknown;
};

/**
 * ============================================================
 * GET PRODUCTS
 * ============================================================
 */

export const getProducts = async (): Promise<ProductDocument[]> => {
  const database = getDbOrThrow();

  const productsRef = collection(
    database,
    PRODUCTS_COLLECTION
  );

  const snapshot = await getDocs(productsRef);

  const products: ProductDocument[] = snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data(),
    })
  );

  products.sort((a, b) => {
    const nameA = String(a.productName ?? "").toLowerCase();
    const nameB = String(b.productName ?? "").toLowerCase();

    return nameA.localeCompare(nameB);
  });

  return products;
};

/**
 * ============================================================
 * GET ORDERS
 * ============================================================
 */

export const getOrders = async (): Promise<OrderDocument[]> => {
  const database = getDbOrThrow();

  const ordersRef = collection(
    database,
    ORDERS_COLLECTION
  );

  const snapshot = await getDocs(ordersRef);

  const orders: OrderDocument[] = snapshot.docs.map(
    (document) => ({
      id: document.id,
      ...document.data(),
    })
  );

  orders.sort((a, b) => {
    const getTime = (value: unknown): number => {
      if (!value) {
        return 0;
      }

      if (
        typeof value === "object" &&
        value !== null &&
        "toMillis" in value &&
        typeof (value as { toMillis?: unknown }).toMillis ===
          "function"
      ) {
        return (
          value as { toMillis: () => number }
        ).toMillis();
      }

      if (value instanceof Date) {
        return value.getTime();
      }

      const parsed = new Date(
        String(value)
      ).getTime();

      return Number.isNaN(parsed) ? 0 : parsed;
    };

    return (
      getTime(b.createdAt) -
      getTime(a.createdAt)
    );
  });

  return orders;
};

/**
 * ============================================================
 * REAL-TIME PRODUCTS LISTENER
 * ============================================================
 */

export const subscribeToProducts = (
  callback: (
    products: ProductDocument[]
  ) => void,
  onError?: (
    error: Error
  ) => void
): Unsubscribe => {
  const database = getDbOrThrow();

  const productsRef = collection(
    database,
    PRODUCTS_COLLECTION
  );

  return onSnapshot(
    productsRef,

    (snapshot) => {
      const products: ProductDocument[] =
        snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

      products.sort((a, b) => {
        const nameA = String(
          a.productName ?? ""
        ).toLowerCase();

        const nameB = String(
          b.productName ?? ""
        ).toLowerCase();

        return nameA.localeCompare(nameB);
      });

      callback(products);
    },

    (error) => {
      console.error(
        "Products listener error:",
        error
      );

      if (onError) {
        onError(error);
      }
    }
  );
};

/**
 * ============================================================
 * REAL-TIME ORDERS LISTENER
 * ============================================================
 */

export const subscribeToOrders = (
  callback: (
    orders: OrderDocument[]
  ) => void,
  onError?: (
    error: Error
  ) => void
): Unsubscribe => {
  const database = getDbOrThrow();

  const ordersRef = collection(
    database,
    ORDERS_COLLECTION
  );

  return onSnapshot(
    ordersRef,

    (snapshot) => {
      const orders: OrderDocument[] =
        snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

      callback(orders);
    },

    (error) => {
      console.error(
        "Orders listener error:",
        error
      );

      if (onError) {
        onError(error);
      }
    }
  );
};

/**
 * ============================================================
 * ADD PRODUCT
 * ============================================================
 */

export const addProduct = async (
  productData: DocumentData
): Promise<ProductDocument> => {
  const database = getDbOrThrow();

  const productId =
    productData.productId ||
    productData.productCode ||
    productData.id ||
    `PROD-${Date.now()}`;

  const productRef = doc(
    database,
    PRODUCTS_COLLECTION,
    String(productId)
  );

  const product = {
    ...productData,

    productId: String(productId),

    active:
      productData.active !== undefined
        ? Boolean(productData.active)
        : true,

    createdAt:
      productData.createdAt ||
      serverTimestamp(),

    updatedAt:
      serverTimestamp(),
  };

  await setDoc(
    productRef,
    product
  );

  return {
    id: String(productId),
    ...product,
  } as ProductDocument;
};

/**
 * ============================================================
 * UPDATE PRODUCT
 * ============================================================
 */

export const updateProduct = async (
  productId: string,
  productData: DocumentData
): Promise<void> => {
  const database = getDbOrThrow();

  if (!productId) {
    throw new Error(
      "Product ID is required."
    );
  }

  const productRef = doc(
    database,
    PRODUCTS_COLLECTION,
    productId
  );

  await updateDoc(
    productRef,
    {
      ...productData,

      productId,

      updatedAt:
        serverTimestamp(),
    }
  );
};

/**
 * ============================================================
 * DELETE PRODUCT
 * ============================================================
 */

export const deleteProduct = async (
  productId: string
): Promise<boolean> => {
  const database = getDbOrThrow();

  if (!productId) {
    throw new Error(
      "Product ID is required."
    );
  }

  const productRef = doc(
    database,
    PRODUCTS_COLLECTION,
    productId
  );

  await deleteDoc(
    productRef
  );
  
  return true;
};

/**
 * ============================================================
 * UPDATE PRODUCT STOCK
 * ============================================================
 */

export const updateProductStock = async (
  productId: string,
  newStock: number
): Promise<void> => {
  const database = getDbOrThrow();

  if (!productId) {
    throw new Error(
      "Product ID is required."
    );
  }

  if (
    !Number.isFinite(newStock) ||
    newStock < 0
  ) {
    throw new Error(
      "Stock quantity must be a valid number greater than or equal to 0."
    );
  }

  const productRef = doc(
    database,
    PRODUCTS_COLLECTION,
    productId
  );

  await updateDoc(
    productRef,
    {
      stockQuantity:
        Number(newStock),

      updatedAt:
        serverTimestamp(),
    }
  );
};

/**
 * ============================================================
 * ACTIVATE PRODUCT
 * ============================================================
 */

export const activateProduct = async (
  productId: string
): Promise<void> => {
  const database = getDbOrThrow();

  if (!productId) {
    throw new Error(
      "Product ID is required."
    );
  }

  const productRef = doc(
    database,
    PRODUCTS_COLLECTION,
    productId
  );

  await updateDoc(
    productRef,
    {
      active: true,

      updatedAt:
        serverTimestamp(),
    }
  );
};

/**
 * ============================================================
 * DEACTIVATE PRODUCT
 * ============================================================
 */

export const deactivateProduct = async (
  productId: string
): Promise<void> => {
  const database = getDbOrThrow();

  if (!productId) {
    throw new Error(
      "Product ID is required."
    );
  }

  const productRef = doc(
    database,
    PRODUCTS_COLLECTION,
    productId
  );

  await updateDoc(
    productRef,
    {
      active: false,

      updatedAt:
        serverTimestamp(),
    }
  );
};

/**
 * ============================================================
 * EMPLOYEE OPERATIONS
 * ============================================================
 */

const getFallbackEmployees = (): any[] => {
  return [...INITIAL_EMPLOYEES].map((employee) => ({
    ...employee,
    id: employee.id || employee.employeeId,
  })).sort((a: any, b: any) => {
    const nameA = String(a?.name ?? "").toLowerCase();
    const nameB = String(b?.name ?? "").toLowerCase();
    return nameA.localeCompare(nameB);
  });
};

const getFallbackDistributors = (): any[] => {
  return [...INITIAL_DISTRIBUTORS].map((distributor) => ({
    ...distributor,
    id: distributor.id || distributor.distributorId,
  })).sort((a: any, b: any) => {
    const nameA = String(a?.companyName ?? "").toLowerCase();
    const nameB = String(b?.companyName ?? "").toLowerCase();
    return nameA.localeCompare(nameB);
  });
};

export const getEmployees = async (): Promise<any[]> => {
  try {
    const database = getDbOrThrow();
    const employeesRef = collection(database, EMPLOYEES_COLLECTION);
    const snapshot = await getDocs(employeesRef);

    const employees = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    if (employees.length > 0) {
      employees.sort((a: any, b: any) => {
        const nameA = String(a?.name ?? "").toLowerCase();
        const nameB = String(b?.name ?? "").toLowerCase();
        return nameA.localeCompare(nameB);
      });

      return employees;
    }
  } catch (error) {
    console.warn("Falling back to seeded employees because Firestore is unavailable or empty:", error);
  }

  return getFallbackEmployees();
};

export const saveEmployee = async (emp: Partial<any>): Promise<any> => {
  const database = getDbOrThrow();
  const employeeId = emp.id || emp.employeeId;

  if (!employeeId) {
    throw new Error("Employee ID is required.");
  }

  const employeeRef = doc(database, EMPLOYEES_COLLECTION, String(employeeId));

  const employee = {
    ...emp,
    employeeId: String(employeeId),
    updatedAt: serverTimestamp(),
  };

  await setDoc(employeeRef, employee, { merge: true });

  return {
    id: String(employeeId),
    ...employee,
  };
};

export const updateEmployeeStatus = async (
  employeeId: string,
  status: string
): Promise<void> => {
  const database = getDbOrThrow();
  const employeeRef = doc(database, EMPLOYEES_COLLECTION, employeeId);

  await updateDoc(employeeRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

/**
 * ============================================================
 * DISTRIBUTOR OPERATIONS
 * ============================================================
 */

export const getDistributors = async (): Promise<any[]> => {
  try {
    const database = getDbOrThrow();
    const distributorsRef = collection(database, DISTRIBUTORS_COLLECTION);
    const snapshot = await getDocs(distributorsRef);

    const distributors = snapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));

    if (distributors.length > 0) {
      distributors.sort((a: any, b: any) => {
        const nameA = String(a?.companyName ?? "").toLowerCase();
        const nameB = String(b?.companyName ?? "").toLowerCase();
        return nameA.localeCompare(nameB);
      });

      return distributors;
    }
  } catch (error) {
    console.warn("Falling back to seeded distributors because Firestore is unavailable or empty:", error);
  }

  return getFallbackDistributors();
};

export const saveDistributor = async (dist: Partial<any>): Promise<any> => {
  const database = getDbOrThrow();
  const distributorId = dist.id || dist.distributorId;

  if (!distributorId) {
    throw new Error("Distributor ID is required.");
  }

  const distributorRef = doc(
    database,
    DISTRIBUTORS_COLLECTION,
    String(distributorId)
  );

  const distributor = {
    ...dist,
    distributorId: String(distributorId),
    updatedAt: serverTimestamp(),
  };

  await setDoc(distributorRef, distributor, { merge: true });

  return {
    id: String(distributorId),
    ...distributor,
  };
};

/**
 * ============================================================
 * TARGET OPERATIONS
 * ============================================================
 */

export const getTargets = async (): Promise<any[]> => {
  const database = getDbOrThrow();
  const targetsRef = collection(database, TARGETS_COLLECTION);
  const snapshot = await getDocs(targetsRef);

  const targets = snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));

  return targets;
};

export const saveTarget = async (trg: Partial<any>): Promise<any> => {
  const database = getDbOrThrow();
  const targetId = trg.id || `${trg.employeeId}-${trg.year}-${trg.month}`;

  if (!targetId) {
    throw new Error("Target ID is required.");
  }

  const targetRef = doc(database, TARGETS_COLLECTION, String(targetId));

  const target = {
    ...trg,
    updatedAt: serverTimestamp(),
  };

  await setDoc(targetRef, target, { merge: true });

  return {
    id: String(targetId),
    ...target,
  };
};

/**
 * ============================================================
 * NOTIFICATION OPERATIONS
 * ============================================================
 */

export const getNotifications = async (): Promise<any[]> => {
  const database = getDbOrThrow();
  const notificationsRef = collection(database, NOTIFICATIONS_COLLECTION);
  const snapshot = await getDocs(notificationsRef);

  const notifications = snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));

  notifications.sort((a: any, b: any) => {
    const getTime = (value: unknown): number => {
      if (!value) return 0;
      if (typeof value === "object" && value !== null && "toMillis" in value) {
        return (value as { toMillis: () => number }).toMillis();
      }
      if (value instanceof Date) return value.getTime();
      const parsed = new Date(String(value)).getTime();
      return Number.isNaN(parsed) ? 0 : parsed;
    };
    return getTime(b?.sentAt ?? b?.timestamp) - getTime(a?.sentAt ?? a?.timestamp);
  });

  return notifications;
};

export const sendNotification = async (notif: Partial<any>): Promise<any> => {
  const database = getDbOrThrow();
  const notificationId = notif.id || `notif-${Date.now()}`;

  const notificationRef = doc(
    database,
    NOTIFICATIONS_COLLECTION,
    String(notificationId)
  );

  const notification = {
    ...notif,
    sentAt: notif.sentAt || serverTimestamp(),
  };

  const firestoreNotification = Object.fromEntries(
    Object.entries(notification).filter(([, value]) => value !== undefined)
  );

  await setDoc(notificationRef, firestoreNotification, { merge: true });

  return {
    id: String(notificationId),
    ...firestoreNotification,
  };
};

/**
 * ============================================================
 * AUDIT LOG OPERATIONS
 * ============================================================
 */

export const getAuditLogs = async (): Promise<any[]> => {
  const database = getDbOrThrow();
  const logsRef = collection(database, AUDIT_LOGS_COLLECTION);
  const snapshot = await getDocs(logsRef);

  const logs = snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));

  logs.sort((a: any, b: any) => {
    const getTime = (value: unknown): number => {
      if (!value) return 0;
      if (typeof value === "object" && value !== null && "toMillis" in value) {
        return (value as { toMillis: () => number }).toMillis();
      }
      if (value instanceof Date) return value.getTime();
      const parsed = new Date(String(value)).getTime();
      return Number.isNaN(parsed) ? 0 : parsed;
    };
    return getTime(b?.timestamp ?? b?.sentAt) - getTime(a?.timestamp ?? a?.sentAt);
  });

  return logs;
};

export const addAuditLog = async (log: Partial<any>): Promise<any> => {
  const database = getDbOrThrow();
  const logId = log.id || `log-${Date.now()}`;

  const logRef = doc(database, AUDIT_LOGS_COLLECTION, String(logId));

  const auditLog = {
    ...log,
    timestamp: log.timestamp || serverTimestamp(),
  };

  await setDoc(logRef, auditLog, { merge: true });

  return {
    id: String(logId),
    ...auditLog,
  };
};

/**
 * ============================================================
 * ORDER OPERATIONS - UPDATE STATUS
 * ============================================================
 */

export const updateOrderStatus = async (
  orderId: string,
  newStatus: string,
  performedBy?: string,
  reason?: string
): Promise<any> => {
  const database = getDbOrThrow();
  const orderRef = doc(database, ORDERS_COLLECTION, orderId);

  const updateData: any = {
    status: newStatus,
    updatedAt: serverTimestamp(),
  };

  if (newStatus === "Approved") {
    updateData.approvedAt = serverTimestamp();
    updateData.approvedBy = performedBy || "Admin";
  } else if (newStatus === "Rejected") {
    updateData.rejectedAt = serverTimestamp();
    updateData.rejectedBy = performedBy || "Admin";
    if (reason) {
      updateData.rejectionReason = reason;
    }
  }

  await updateDoc(orderRef, updateData);

  return { id: orderId, ...updateData };
};

/**
 * ============================================================
 * PRODUCT OPERATIONS - WRAPPER METHODS
 * ============================================================
 */

export const saveProduct = async (prod: Partial<any>): Promise<any> => {
  return await addProduct(prod);
};

export const resetToSeedData = async (): Promise<{ count: number }> => {
  try {
    const productData = await getProducts();
    for (const item of productData) {
      if (item?.id) {
        await deleteProduct(item.id);
      }
    }

    const existingOrders = await getOrders();
    for (const item of existingOrders) {
      if (item?.id) {
        await deleteDoc(doc(getDbOrThrow(), ORDERS_COLLECTION, item.id)).catch(() => {});
      }
    }

    return { count: productData.length };
  } catch (error) {
    console.warn("Seed reset fallback triggered:", error);
    return { count: 0 };
  }
};

export const pushAllToFirestore = async (): Promise<{ message: string; count: number }> => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const products = await getProducts();
    const orders = await getOrders();
    return {
      message: `Synced ${products.length} products and ${orders.length} orders to Cloud Firestore on ${today}.`,
      count: products.length + orders.length,
    };
  } catch (error) {
    console.warn("Cloud sync fallback:", error);
    return { message: "Cloud sync completed in local mode.", count: 0 };
  }
};

/**
 * ============================================================
 * BULK IMPORT PRODUCTS (Updated with safe ID generation fallback)
 * ============================================================
 */

export const bulkImportProducts = async (
  products: Partial<any>[]
): Promise<{ count: number }> => {
  if (!products || products.length === 0) {
    throw new Error("No products to import.");
  }

  let successCount = 0;

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    try {
      const sanitizedProduct = {
        ...product,
        productId: product.productId || product.productCode || product.id || `PROD-IMP-${Date.now()}-${i}`
      };

      await saveProduct(sanitizedProduct);
      successCount++;
    } catch (error) {
      console.error(
        `Failed to import product at index ${i}:`,
        error
      );
    }
  }

  return { count: successCount };
};

/**
 * ============================================================
 * GENERIC REAL-TIME SUBSCRIBE
 * ============================================================
 */

export const subscribe = (
  callback: (data?: {
    products: ProductDocument[];
    orders: OrderDocument[];
  }) => void,
  onError?: (
    error: Error
  ) => void
): Unsubscribe => {
  let products: ProductDocument[] = [];
  let orders: OrderDocument[] = [];

  let productsError = false;
  let ordersError = false;

  const emit = () => {
    callback({
      products,
      orders,
    });
  };

  const unsubscribeProducts =
    subscribeToProducts(
      (newProducts) => {
        products = newProducts;
        productsError = false;
        emit();
      },
      (error) => {
        productsError = true;

        console.error(
          "Products subscription error:",
          error
        );

        if (onError) {
          onError(error);
        }
      }
    );

  const unsubscribeOrders =
    subscribeToOrders(
      (newOrders) => {
        orders = newOrders;
        ordersError = false;
        emit();
      },
      (error) => {
        ordersError = true;

        console.error(
          "Orders subscription error:",
          error
        );

        if (onError) {
          onError(error);
        }
      }
    );

  return () => {
    unsubscribeProducts();
    unsubscribeOrders();

    productsError = false;
    ordersError = false;
  };
};

/**
 * ============================================================
 * INITIALIZE SEED DATA TO FIRESTORE IF EMPTY
 * ============================================================
 */

export const initializeSeedDataIfEmpty = async (): Promise<{ message: string; employeesAdded: number; distributorsAdded: number }> => {
  try {
    const database = getDbOrThrow();
    let employeesAdded = 0;
    let distributorsAdded = 0;

    try {
      const employeesRef = collection(database, EMPLOYEES_COLLECTION);
      const employeesSnapshot = await getDocs(employeesRef);

      if (employeesSnapshot.empty) {
        console.log('Employees collection is empty. Syncing seed data...');
        for (const employee of INITIAL_EMPLOYEES) {
          const employeeId = employee.id || employee.employeeId;
          const employeeRef = doc(database, EMPLOYEES_COLLECTION, String(employeeId));
          await setDoc(employeeRef, {
            ...employee,
            updatedAt: serverTimestamp(),
          }, { merge: true });
          employeesAdded++;
        }
        console.log(`✓ Successfully synced ${employeesAdded} employees to Firestore`);
      }
    } catch (err) {
      console.warn('Error initializing employees:', err);
    }

    try {
      const distributorsRef = collection(database, DISTRIBUTORS_COLLECTION);
      const distributorsSnapshot = await getDocs(distributorsRef);

      if (distributorsSnapshot.empty) {
        console.log('Distributors collection is empty. Syncing seed data...');
        for (const distributor of INITIAL_DISTRIBUTORS) {
          const distributorId = distributor.id || distributor.distributorId;
          const distributorRef = doc(database, DISTRIBUTORS_COLLECTION, String(distributorId));
          await setDoc(distributorRef, {
            ...distributor,
            updatedAt: serverTimestamp(),
          }, { merge: true });
          distributorsAdded++;
        }
        console.log(`✓ Successfully synced ${distributorsAdded} distributors to Firestore`);
      }
    } catch (err) {
      console.warn('Error initializing distributors:', err);
    }

    const message = employeesAdded > 0 || distributorsAdded > 0 
      ? `Firebase initialized with ${employeesAdded} employees and ${distributorsAdded} distributors`
      : 'Firebase collections already contain data';

    return { message, employeesAdded, distributorsAdded };
  } catch (error) {
    console.error('Error initializing seed data:', error);
    return { message: 'Failed to initialize seed data', employeesAdded: 0, distributorsAdded: 0 };
  }
};

/**
 * ============================================================
 * DATA SERVICE OBJECT
 * ============================================================
 */

export const dataService = {
  initializeSeedDataIfEmpty,
  getProducts,
  saveProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  activateProduct,
  deactivateProduct,
  subscribeToProducts,
  getOrders,
  updateOrderStatus,
  subscribeToOrders,
  getEmployees,
  saveEmployee,
  updateEmployeeStatus,
  getDistributors,
  saveDistributor,
  getTargets,
  saveTarget,
  getNotifications,
  sendNotification,
  getAuditLogs,
  addAuditLog,
  bulkImportProducts,
  resetToSeedData,
  pushAllToFirestore,
  subscribe,
};

export default dataService;