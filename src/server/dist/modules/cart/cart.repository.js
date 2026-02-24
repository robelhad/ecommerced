"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartRepository = void 0;
const client_1 = require("@prisma/client");
const database_config_1 = __importDefault(require("../../infra/database/database.config"));
class CartRepository {
    getCartByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log("🔍 [CART REPOSITORY] getCartByUserId called");
            console.log("🔍 [CART REPOSITORY] userId:", userId);
            const cart = yield database_config_1.default.cart.findFirst({
                where: { userId },
                include: {
                    cartItems: { include: { variant: { include: { product: true } } } },
                },
            });
            console.log("🔍 [CART REPOSITORY] Cart found by userId:", cart);
            console.log("🔍 [CART REPOSITORY] Cart ID:", cart === null || cart === void 0 ? void 0 : cart.id);
            console.log("🔍 [CART REPOSITORY] Cart items count:", (_a = cart === null || cart === void 0 ? void 0 : cart.cartItems) === null || _a === void 0 ? void 0 : _a.length);
            return cart;
        });
    }
    getCartBySessionId(sessionId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log("🔍 [CART REPOSITORY] getCartBySessionId called");
            console.log("🔍 [CART REPOSITORY] sessionId:", sessionId);
            const cart = yield database_config_1.default.cart.findUnique({
                where: { sessionId },
                include: {
                    cartItems: { include: { variant: { include: { product: true } } } },
                },
            });
            console.log("🔍 [CART REPOSITORY] Cart found by sessionId:", cart);
            console.log("🔍 [CART REPOSITORY] Cart ID:", cart === null || cart === void 0 ? void 0 : cart.id);
            console.log("🔍 [CART REPOSITORY] Cart items count:", (_a = cart === null || cart === void 0 ? void 0 : cart.cartItems) === null || _a === void 0 ? void 0 : _a.length);
            return cart;
        });
    }
    createCart(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🔍 [CART REPOSITORY] createCart called");
            console.log("🔍 [CART REPOSITORY] data:", data);
            const cart = yield database_config_1.default.cart.create({
                data,
                include: {
                    cartItems: { include: { variant: { include: { product: true } } } },
                },
            });
            console.log("🔍 [CART REPOSITORY] Cart created:", cart);
            console.log("🔍 [CART REPOSITORY] Cart ID:", cart.id);
            return cart;
        });
    }
    findCartItem(cartId, variantId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🔍 [CART REPOSITORY] findCartItem called");
            console.log("🔍 [CART REPOSITORY] cartId:", cartId);
            console.log("🔍 [CART REPOSITORY] variantId:", variantId);
            const item = yield database_config_1.default.cartItem.findFirst({
                where: { cartId, variantId },
            });
            console.log("🔍 [CART REPOSITORY] Cart item found:", item);
            return item;
        });
    }
    addItemToCart(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🔍 [CART REPOSITORY] addItemToCart called");
            console.log("🔍 [CART REPOSITORY] data:", data);
            try {
                // Validate stock
                const variant = yield database_config_1.default.productVariant.findUnique({
                    where: { id: data.variantId },
                    select: { stock: true },
                });
                console.log("🔍 [CART REPOSITORY] Variant found for stock check:", variant);
                if (!variant) {
                    console.log("🔍 [CART REPOSITORY] ERROR: Variant not found");
                    throw new Error("Variant not found");
                }
                if (variant.stock < data.quantity) {
                    console.log("🔍 [CART REPOSITORY] ERROR: Insufficient stock");
                    throw new Error(`Insufficient stock: only ${variant.stock} available`);
                }
                const item = yield database_config_1.default.cartItem.create({ data });
                console.log("🔍 [CART REPOSITORY] Cart item created:", item);
                return item;
            }
            catch (error) {
                console.log("🔍 [CART REPOSITORY] Error in addItemToCart:", error);
                if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                    error.code === "P2002") {
                    console.log("🔍 [CART REPOSITORY] ERROR: Item already exists in cart");
                    throw new Error("Item already exists in cart");
                }
                throw error;
            }
        });
    }
    updateCartItemQuantity(itemId, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🔍 [CART REPOSITORY] updateCartItemQuantity called");
            console.log("🔍 [CART REPOSITORY] itemId:", itemId);
            console.log("🔍 [CART REPOSITORY] quantity:", quantity);
            // Validate stock
            const cartItem = yield database_config_1.default.cartItem.findUnique({
                where: { id: itemId },
                include: { variant: true },
            });
            console.log("🔍 [CART REPOSITORY] Cart item found for update:", cartItem);
            if (!cartItem) {
                console.log("🔍 [CART REPOSITORY] ERROR: Cart item not found");
                throw new Error("Cart item not found");
            }
            if (cartItem.variant.stock < quantity) {
                console.log("🔍 [CART REPOSITORY] ERROR: Insufficient stock for update");
                throw new Error(`Insufficient stock: only ${cartItem.variant.stock} available`);
            }
            const updatedItem = yield database_config_1.default.cartItem.update({
                where: { id: itemId },
                data: { quantity },
            });
            console.log("🔍 [CART REPOSITORY] Cart item updated:", updatedItem);
            return updatedItem;
        });
    }
    removeCartItem(itemId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🔍 [CART REPOSITORY] removeCartItem called");
            console.log("🔍 [CART REPOSITORY] itemId:", itemId);
            const result = yield database_config_1.default.cartItem.delete({ where: { id: itemId } });
            console.log("🔍 [CART REPOSITORY] Cart item removed:", result);
            return result;
        });
    }
    mergeCarts(sessionCartId, userCartId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🔍 [CART REPOSITORY] mergeCarts called");
            console.log("🔍 [CART REPOSITORY] sessionCartId:", sessionCartId);
            console.log("🔍 [CART REPOSITORY] userCartId:", userCartId);
            const sessionItems = yield database_config_1.default.cartItem.findMany({
                where: { cartId: sessionCartId },
                include: { variant: true },
            });
            console.log("🔍 [CART REPOSITORY] Session items found:", sessionItems);
            for (const item of sessionItems) {
                const existingItem = yield database_config_1.default.cartItem.findFirst({
                    where: { cartId: userCartId, variantId: item.variantId },
                });
                console.log("🔍 [CART REPOSITORY] Existing item in user cart:", existingItem);
                if (existingItem) {
                    const newQuantity = existingItem.quantity + item.quantity;
                    console.log("🔍 [CART REPOSITORY] Merging quantities:", newQuantity);
                    if (item.variant.stock < newQuantity) {
                        console.log("🔍 [CART REPOSITORY] ERROR: Insufficient stock after merge");
                        throw new Error(`Insufficient stock for variant ${item.variantId}: only ${item.variant.stock} available`);
                    }
                    yield database_config_1.default.cartItem.update({
                        where: { id: existingItem.id },
                        data: { quantity: newQuantity },
                    });
                    console.log("🔍 [CART REPOSITORY] Item quantity updated in user cart");
                }
                else {
                    console.log("🔍 [CART REPOSITORY] Adding new item to user cart");
                    if (item.variant.stock < item.quantity) {
                        console.log("🔍 [CART REPOSITORY] ERROR: Insufficient stock for new item");
                        throw new Error(`Insufficient stock for variant ${item.variantId}: only ${item.variant.stock} available`);
                    }
                    yield database_config_1.default.cartItem.create({
                        data: {
                            cartId: userCartId,
                            variantId: item.variantId,
                            quantity: item.quantity,
                        },
                    });
                    console.log("🔍 [CART REPOSITORY] New item added to user cart");
                }
            }
            yield database_config_1.default.cart.delete({ where: { id: sessionCartId } });
            console.log("🔍 [CART REPOSITORY] Session cart deleted");
        });
    }
    deleteCart(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🔍 [CART REPOSITORY] deleteCart called");
            console.log("🔍 [CART REPOSITORY] cartId:", id);
            const result = yield database_config_1.default.cart.delete({ where: { id } });
            console.log("🔍 [CART REPOSITORY] Cart deleted:", result);
            return result;
        });
    }
    clearCart(userId, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("🔍 [CART REPOSITORY] clearCart called");
            console.log("🔍 [CART REPOSITORY] userId:", userId);
            const client = tx || database_config_1.default;
            const cart = yield client.cart.findFirst({
                where: { userId },
            });
            console.log("🔍 [CART REPOSITORY] Cart found to be cleared:", cart);
            if (!cart) {
                console.log("🔍 [CART REPOSITORY] No cart found to clear");
                return;
            }
            const result = yield client.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
            console.log("🔍 [CART REPOSITORY] Cart items cleared:", result);
            return result;
        });
    }
}
exports.CartRepository = CartRepository;
