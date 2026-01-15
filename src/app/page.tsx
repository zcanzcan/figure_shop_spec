"use client";

import { useState, useEffect } from "react";
import { products, Product, Category } from "@/lib/data";
import { ShoppingCart, X, Plus, Minus, CreditCard, Search, CheckCircle2, MapPin, User, Phone, Mail, ArrowRight, ChevronRight } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CartItem extends Product {
    quantity: number;
}

interface OrderForm {
    name: string;
    phone: string;
    email: string;
    address: string;
}

// --- PortOne V2 Configuration (Modify this with your console settings) ---
const PORTONE_STORE_ID = "iamporttest_3"; // Your Store ID (상점 ID)
const PORTONE_CHANNEL_KEY = "channel-key-8596b44b-d1d7-4983-a34a-54910d976b60"; // Your Channel Key (채널 키)
// -------------------------------------------------------------------

export default function FigureShop() {
    const [selectedCategory, setSelectedCategory] = useState<Category | "All">("All");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState<any>(null);

    const [form, setForm] = useState<OrderForm>({
        name: "",
        phone: "",
        email: "",
        address: "",
    });

    // Load cart from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem("figure-shop-cart");
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to localStorage
    useEffect(() => {
        localStorage.setItem("figure-shop-cart", JSON.stringify(cart));
    }, [cart]);

    const filteredProducts = products.filter((p) => {
        const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchSearch;
    });

    const addToCart = (product: Product) => {
        if (product.stockStatus === "SOLD_OUT") return;

        setCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const isFormValid = form.name && form.phone && form.email && form.address;

    const handlePayment = async () => {
        if (!isFormValid) {
            alert("모든 주문 정보를 입력해주세요.");
            return;
        }

        const { PortOne } = window as any;
        if (!PortOne) {
            alert("결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
            return;
        }

        try {
            const paymentId = `payment-${new Date().getTime()}`;
            const response = await PortOne.requestPayment({
                storeId: PORTONE_STORE_ID,
                channelKey: PORTONE_CHANNEL_KEY,
                paymentId,
                orderName: `피규어 샵 주문: ${cart[0].name}${cart.length > 1 ? ` 외 ${cart.length - 1}건` : ""}`,
                totalAmount: totalPrice,
                currency: "CURRENCY_KRW",
                payMethod: "CARD",
                customer: {
                    fullName: form.name,
                    phoneNumber: form.phone,
                    email: form.email,
                    address: form.address,
                    zipcode: "12345",
                },
            });

            if (response.code != null) {
                // Error occurred during request
                alert(`결제 요청 실패: ${response.message}`);
                return;
            }

            const orderSummary = {
                orderId: paymentId,
                items: cart,
                totalPrice,
                date: new Date().toISOString(),
                buyer: form
            };
            localStorage.setItem("last-order", JSON.stringify(orderSummary));
            setOrderSuccess(orderSummary);
            setCart([]);
            setIsCartOpen(false);
            setShowCheckoutForm(false);
        } catch (error: any) {
            alert(`결제 중 오류가 발생했습니다: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-accent-gold selection:text-black scroll-smooth">
            {/* Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
                    <h1 className="text-2xl font-black tracking-tighter italic flex items-center group cursor-pointer">
                        <span className="text-accent-gold group-hover:text-white transition-colors duration-500">COLLECTOR</span>
                        <span className="text-white ml-1.5 group-hover:text-accent-gold transition-colors duration-500">SHOP</span>
                    </h1>

                    <div className="flex items-center gap-8">
                        <div className="hidden lg:flex gap-6">
                            {["All", "Marvel", "Anime", "Game"].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat as any)}
                                    className={cn(
                                        "text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 hover:text-accent-gold",
                                        selectedCategory === cat ? "text-accent-gold" : "text-white/40"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="group relative p-3 bg-white/5 hover:bg-accent-gold rounded-full transition-all duration-500"
                        >
                            <ShoppingCart size={20} className="group-hover:text-black" />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                                    {cart.reduce((a, b) => a + b.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black z-10" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626272828275-3e072935ee1b?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center grayscale contrast-125 opacity-40 scale-110 animate-[pulse_10s_infinite_alternate]" />

                <div className="relative z-20 text-center max-w-5xl px-6">
                    <div className="overflow-hidden mb-6">
                        <span className="inline-block text-accent-gold font-black tracking-[0.5em] uppercase text-[10px] md:text-xs animate-slide-up">
                            Establishment of Excellence
                        </span>
                    </div>

                    <h2 className="text-7xl md:text-[10rem] font-black italic tracking-tighter mb-10 leading-[0.85] uppercase">
                        <span className="block animate-slide-up [animation-delay:0.2s]">Master</span>
                        <span className="block gold-gradient-text animate-slide-up [animation-delay:0.4s]">Collection.</span>
                    </h2>

                    <div className="max-w-2xl mx-auto mb-12 overflow-hidden">
                        <p className="text-sm md:text-base text-white/40 font-medium leading-loose animate-slide-up [animation-delay:0.6s]">
                            최상의 디테일과 예술적 가치를 담은 마스터피스. <br className="hidden md:block" />
                            전 세계가 열광하는 하이엔드 컬렉터블의 정점을 경험하십시오.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center animate-slide-up [animation-delay:0.8s]">
                        <button className="btn-gold px-12 py-5 rounded-full text-xs min-w-[200px] shadow-[0_20px_40px_-10px_rgba(212,175,55,0.3)]">
                            Enter the Gallery
                        </button>
                        <button className="px-12 py-5 rounded-full border border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/5 hover:border-white/30 transition-all duration-500 min-w-[200px] backdrop-blur-sm">
                            Curated Series
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 opacity-30 animate-pulse">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] rotate-90 origin-left ml-2">Scroll</span>
                    <div className="w-px h-12 bg-gradient-to-b from-accent-gold to-transparent" />
                </div>
            </section>

            {/* Filter & Search */}
            <section className="max-w-7xl mx-auto px-6 py-24">
                <div className="flex flex-col lg:flex-row gap-10 justify-between items-end mb-20">
                    <div className="space-y-4 w-full lg:w-auto">
                        <h3 className="text-3xl font-black italic uppercase tracking-tighter">Collections</h3>
                        <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl w-fit">
                            {["All", "Marvel", "Anime", "Game"].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat as any)}
                                    className={cn(
                                        "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500",
                                        selectedCategory === cat ? "bg-white text-black shadow-xl" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative w-full lg:w-96 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent-gold transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search figures..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-14 py-4 focus:outline-none focus:border-accent-gold/50 focus:bg-white/[0.08] transition-all duration-500"
                        />
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {filteredProducts.map((product, idx) => (
                        <div
                            key={product.id}
                            className="group relative flex flex-col glass-card rounded-[2.5rem] overflow-hidden hover:translate-y-[-10px] transition-all duration-700 animate-slide-up"
                            style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                            <div className="aspect-[4/5] overflow-hidden bg-black relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-[2s] cubic-bezier(0.23, 1, 0.32, 1)"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />

                                {product.stockStatus === "SOLD_OUT" && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] z-10 transition-all duration-500 group-hover:bg-black/30 group-hover:backdrop-blur-none">
                                        <div className="px-8 py-3 border border-white/20 bg-black/60 text-white font-black uppercase text-[10px] tracking-[0.4em] shadow-2xl backdrop-blur-md">
                                            Sold Out
                                        </div>
                                    </div>
                                )}

                                <div className="absolute top-8 left-8">
                                    <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-[10px] font-black text-white/60">
                                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                                    </div>
                                </div>

                                <div className="absolute top-8 right-8">
                                    {product.stockStatus === "LOW_STOCK" && (
                                        <div className="bg-[#D4AF37] text-black px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(212,175,55,0.3)]">
                                            Limited
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-10 flex flex-col flex-1">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-accent-gold text-[9px] font-black uppercase tracking-[0.3em] py-1 px-3 bg-accent-gold/10 rounded-full border border-accent-gold/20">
                                        {product.category}
                                    </span>
                                    <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.15em]">
                                        Scale {product.scale}
                                    </span>
                                </div>

                                <h4 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-accent-gold transition-colors duration-500 line-clamp-1">
                                    {product.name}
                                </h4>

                                <p className="text-white/30 text-[11px] font-medium mb-10 flex items-center gap-3">
                                    {product.manufacturer} <span className="w-1 h-1 rounded-full bg-accent-gold/40" /> {product.edition}
                                </p>

                                <div className="mt-auto pt-8 border-t border-white/5 flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-1.5">Investment</span>
                                        <span className="text-2xl font-black italic tracking-tighter">₩{product.price.toLocaleString()}</span>
                                    </div>
                                    <button
                                        onClick={() => addToCart(product)}
                                        disabled={product.stockStatus === "SOLD_OUT"}
                                        className={cn(
                                            "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500",
                                            product.stockStatus === "SOLD_OUT"
                                                ? "bg-white/5 text-white/10 cursor-not-allowed"
                                                : "bg-[#D4AF37] text-black hover:bg-white hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] active:scale-90"
                                        )}
                                    >
                                        <Plus size={22} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[100] overflow-hidden">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setIsCartOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-[#0a0a0a] border-l border-white/5 shadow-2xl flex flex-col transform transition-transform duration-700 ease-out animate-slide-in-right">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                                    <ShoppingCart className="text-accent-gold" size={28} />
                                    {showCheckoutForm ? "Checkout Info" : "Shopping Cart"}
                                </h3>
                                <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest">
                                    {showCheckoutForm ? "Please provide your shipping details" : `${cart.length} items in your selection`}
                                </p>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors group">
                                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 py-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-white/10">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                        <ShoppingCart size={40} strokeWidth={1.5} />
                                    </div>
                                    <p className="font-black uppercase tracking-widest text-sm">Your cart is empty</p>
                                </div>
                            ) : !showCheckoutForm ? (
                                /* Cart List View */
                                <div className="space-y-8 animate-fade-in">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex gap-6 group">
                                            <div className="w-24 h-32 bg-white/5 rounded-2xl overflow-hidden flex-shrink-0 border border-white/5 transition-transform group-hover:scale-105">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-lg leading-tight uppercase group-hover:text-accent-gold transition-colors">{item.name}</h4>
                                                    <button onClick={() => removeFromCart(item.id)} className="p-1 text-white/20 hover:text-red-500 transition-colors">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                                <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-4">{item.manufacturer} · {item.scale}</p>
                                                <div className="mt-auto flex justify-between items-center">
                                                    <div className="flex items-center gap-5 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                                                        <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-accent-gold transition-colors"><Minus size={14} /></button>
                                                        <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-accent-gold transition-colors"><Plus size={14} /></button>
                                                    </div>
                                                    <span className="font-black italic text-lg">₩{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Checkout Form View */
                                <div className="space-y-8 animate-fade-in">
                                    <div className="grid gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 px-1">
                                                <User size={12} /> 주문자 성함
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="홍길동"
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-accent-gold/50 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 px-1">
                                                <Phone size={12} /> 연락처
                                            </label>
                                            <input
                                                type="tel"
                                                placeholder="010-0000-0000"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-accent-gold/50 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 px-1">
                                                <Mail size={12} /> 이메일
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="collector@example.com"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-accent-gold/50 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 px-1">
                                                <MapPin size={12} /> 배송 주소
                                            </label>
                                            <textarea
                                                placeholder="서울특별시 강남구..."
                                                rows={3}
                                                value={form.address}
                                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-accent-gold/50 transition-all font-medium resize-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-6 bg-accent-gold/5 border border-accent-gold/20 rounded-[2rem]">
                                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-accent-gold mb-2">
                                            <span>주문 요약</span>
                                            <span>{cart.length}개 상품</span>
                                        </div>
                                        <p className="text-[10px] text-white/40 leading-relaxed uppercase tracking-widest">
                                            {cart.map(i => `${i.name} x${i.quantity}`).join(", ")}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-8 bg-white/[0.02] border-t border-white/5 space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col">
                                        <span className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Total Order Value</span>
                                        <span className="text-3xl font-black italic gold-gradient-text">₩{totalPrice.toLocaleString()}</span>
                                    </div>
                                    {!showCheckoutForm && (
                                        <div className="text-[10px] text-white/20 uppercase font-black tracking-widest flex items-center gap-2">
                                            Next step <ArrowRight size={14} />
                                        </div>
                                    )}
                                </div>

                                {showCheckoutForm ? (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setShowCheckoutForm(false)}
                                            className="w-20 bg-white/5 text-white/60 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handlePayment}
                                            disabled={!isFormValid}
                                            className={cn(
                                                "flex-1 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all duration-500",
                                                isFormValid
                                                    ? "bg-accent-gold text-black shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:bg-white hover:shadow-[0_15px_40px_rgba(255,255,255,0.2)]"
                                                    : "bg-white/5 text-white/20 cursor-not-allowed"
                                            )}
                                        >
                                            <CreditCard size={20} />
                                            Pay & Secure Order
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowCheckoutForm(true)}
                                        className="w-full btn-gold py-5 rounded-2xl flex items-center justify-center gap-4 group"
                                    >
                                        Go to Checkout
                                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                )}
                                <p className="text-[10px] text-center text-white/20 uppercase tracking-[0.2em] font-medium">Fully encrypted checkout powered by Portone</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Order Success Modal */}
            {orderSuccess && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl animate-fade-in">
                    <div className="max-w-2xl w-full bg-white/5 border border-white/10 rounded-[3rem] p-12 text-center animate-slide-up relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-accent-gold shadow-[0_0_20px_rgba(212,175,55,0.5)]" />

                        <div className="w-24 h-24 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-accent-gold/30">
                            <CheckCircle2 className="text-accent-gold" size={48} />
                        </div>

                        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4">Order Confirmed</h2>
                        <p className="text-white/40 text-sm font-medium mb-12 uppercase tracking-[0.2em]">Thank you for your business. Your masterpiece is on its way.</p>

                        <div className="grid grid-cols-2 gap-8 text-left mb-12 p-8 bg-black/40 rounded-3xl border border-white/5">
                            <div>
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Order ID</span>
                                <span className="text-sm font-black italic text-accent-gold">{orderSuccess.orderId}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Total Amount</span>
                                <span className="text-sm font-black">₩{orderSuccess.totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="col-span-2 pt-4 border-t border-white/5">
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">Shipping to</span>
                                <span className="text-sm font-medium text-white/70">{orderSuccess.buyer.address}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setOrderSuccess(null)}
                            className="w-full btn-gold py-5 rounded-2xl font-black uppercase tracking-widest transition-all"
                        >
                            Return to Shop
                        </button>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                    <h1 className="text-xl font-black tracking-tighter italic grayscale opacity-20">
                        COLLECTOR<span className="ml-1">SHOP</span>
                    </h1>
                    <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
                        <a href="#" className="hover:text-accent-gold transition-colors">Instagram</a>
                        <a href="#" className="hover:text-accent-gold transition-colors">Privacy</a>
                        <a href="#" className="hover:text-accent-gold transition-colors">Terms</a>
                    </div>
                    <p className="text-[10px] font-medium text-white/10 uppercase tracking-widest">
                        © 2024 Collector Shop. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
