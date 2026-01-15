export type Category = "Marvel" | "Anime" | "Game";
export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "SOLD_OUT";

export interface Product {
    id: string;
    name: string;
    category: Category;
    price: number;
    scale: string;
    manufacturer: string;
    edition: string;
    stockStatus: StockStatus;
    image: string;
}

export const products: Product[] = [
    {
        id: "1",
        name: "Iron Man Mark LXXXV",
        category: "Marvel",
        price: 450000,
        scale: "1/6",
        manufacturer: "Hot Toys",
        edition: "Diecast Limited Edition",
        stockStatus: "IN_STOCK",
        image: "https://images.unsplash.com/photo-1559535332-db9971090158?w=800",
    },
    {
        id: "2",
        name: "Spider-Man (Black & Gold Suit)",
        category: "Marvel",
        price: 320000,
        scale: "1/6",
        manufacturer: "Hot Toys",
        edition: "Regular Edition",
        stockStatus: "LOW_STOCK",
        image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800",
    },
    {
        id: "3",
        name: "Saber Artoria Pendragon",
        category: "Anime",
        price: 280000,
        scale: "1/7",
        manufacturer: "Good Smile Company",
        edition: "Deluxe Edition",
        stockStatus: "IN_STOCK",
        image: "https://images.unsplash.com/photo-1627672360124-4ed09583e14c?w=800",
    },
    {
        id: "4",
        name: "Monkey D. Luffy (Gear 5)",
        category: "Anime",
        price: 150000,
        scale: "Non-scale",
        manufacturer: "Bandai Spirits",
        edition: "First Press Edition",
        stockStatus: "SOLD_OUT",
        image: "https://images.unsplash.com/photo-1621437145747-920f66dbb367?w=800",
    },
    {
        id: "5",
        name: "Elden Ring Malenia",
        category: "Game",
        price: 580000,
        scale: "1/4",
        manufacturer: "PureArts",
        edition: "Collector's Edition",
        stockStatus: "IN_STOCK",
        image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=800",
    },
    {
        id: "6",
        name: "God of War Kratos & Atreus",
        category: "Game",
        price: 890000,
        scale: "1/4",
        manufacturer: "Prime 1 Studio",
        edition: "Ultimate Edition",
        stockStatus: "LOW_STOCK",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
    },
];
