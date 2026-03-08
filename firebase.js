// ============================================
//  ANEESA HAMPERS — Firebase (firebase.js)
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
         onSnapshot, query, orderBy, where, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCT98OpXIDMCHEiZl6PRrQ6GDziOo2hnTM",
  authDomain: "aneesa-hampers.firebaseapp.com",
  projectId: "aneesa-hampers",
  storageBucket: "aneesa-hampers.firebasestorage.app",
  messagingSenderId: "909653560410",
  appId: "1:909653560410:web:397db4fec2d9f042609c63",
  measurementId: "G-4K061HXG2P"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const stor = getStorage(app);

// ── PRODUCTS ──────────────────────────────────

export async function addProduct(data) {
  return await addDoc(collection(db, 'products'), {
    ...data, createdAt: serverTimestamp()
  });
}

export function listenProducts(callback, catFilter = null) {
  let q = catFilter && catFilter !== 'all'
    ? query(collection(db, 'products'), where('category','==',catFilter), orderBy('createdAt','desc'))
    : query(collection(db, 'products'), orderBy('createdAt','desc'));
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function getProducts(catFilter = null) {
  let q = catFilter && catFilter !== 'all'
    ? query(collection(db,'products'), where('category','==',catFilter), orderBy('createdAt','desc'))
    : query(collection(db,'products'), orderBy('createdAt','desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateProduct(id, data) {
  return await updateDoc(doc(db,'products',id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteProduct(id) {
  return await deleteDoc(doc(db,'products',id));
}

// ── ORDERS ────────────────────────────────────

export async function placeOrder(orderData) {
  const ref = await addDoc(collection(db,'orders'), {
    ...orderData, status: 'pending', createdAt: serverTimestamp()
  });
  return ref.id;
}

export function listenOrders(callback) {
  const q = query(collection(db,'orders'), orderBy('createdAt','desc'));
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

export async function updateOrderStatus(id, status) {
  return await updateDoc(doc(db,'orders',id), { status, updatedAt: serverTimestamp() });
}

// ── FILE UPLOAD (photos + videos) ─────────────

export function uploadFile(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    const storRef = ref(stor, path);
    const task = uploadBytesResumable(storRef, file);
    task.on('state_changed',
      snap => onProgress && onProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
      err  => reject(err),
      async () => resolve(await getDownloadURL(task.snapshot.ref))
    );
  });
}

export async function deleteFile(url) {
  try { await deleteObject(ref(stor, url)); } catch(e) { console.warn(e); }
}

// ── CART (localStorage) ───────────────────────

export const Cart = {
  get()  { try{return JSON.parse(localStorage.getItem('ah_cart')||'[]')}catch{return[]} },
  save(i){ localStorage.setItem('ah_cart',JSON.stringify(i)); Cart.badge(); },
  add(p) {
    const items=Cart.get(), ex=items.find(i=>i.id===p.id);
    ex ? ex.qty++ : items.push({...p,qty:1});
    Cart.save(items); Cart.toast(`✅ "${p.name}" added to cart!`);
  },
  remove(id)    { Cart.save(Cart.get().filter(i=>i.id!==id)); },
  updateQty(id,d){ const it=Cart.get(),i=it.find(x=>x.id===id); if(i){i.qty=Math.max(1,i.qty+d);Cart.save(it);} },
  total() { return Cart.get().reduce((s,i)=>s+i.price*(i.qty||1),0); },
  count() { return Cart.get().reduce((s,i)=>s+(i.qty||1),0); },
  clear() { localStorage.removeItem('ah_cart'); Cart.badge(); },
  badge() { document.querySelectorAll('.cart-count').forEach(el=>el.textContent=Cart.count()); },
  toast(msg){
    let t=document.getElementById('ah-toast');
    if(!t){t=document.createElement('div');t.id='ah-toast';
      t.style.cssText='position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#3b0d1a;color:white;padding:11px 24px;border-radius:30px;font-size:0.78rem;z-index:9999;display:none;font-family:Jost,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,0.2);';
      document.body.appendChild(t);}
    t.textContent=msg; t.style.display='block';
    clearTimeout(t._t); t._t=setTimeout(()=>t.style.display='none',2600);
  }
};

// ── WHATSAPP ──────────────────────────────────

export const WA = {
  number: '918639066613',
  open(msg){ window.open(`https://wa.me/${this.number}?text=${encodeURIComponent(msg)}`,'_blank'); },
  orderProduct(p){
    this.open(`Hi! I want to order *${p.name}* — ₹${p.price?.toLocaleString()} from Aneesa Hampers 🎁\nPlease confirm availability!`);
  },
  sendOrder(order){
    const lines = order.items.map(i=>`• ${i.name} ×${i.qty} = ₹${(i.price*i.qty).toLocaleString()}`).join('\n');
    this.open(
`🎁 *New Order — Aneesa Hampers*
━━━━━━━━━━━━━━━
👤 *Name:* ${order.name}
📞 *Phone:* ${order.phone}
📍 *Address:* ${order.address}, ${order.city} - ${order.pincode}
🚚 *Delivery:* ${order.deliveryType}
${order.giftMessage ? `💌 *Gift Message:* ${order.giftMessage}` : ''}
━━━━━━━━━━━━━━━
🛍️ *Items:*
${lines}
━━━━━━━━━━━━━━━
💰 *Total: ₹${order.total.toLocaleString()}*
🆔 *Order ID:* #${order.orderId}`
    );
  }
};

// ── UPI ───────────────────────────────────────

export const UPI = {
  id: '8639066613@ybl',
  name: 'Aneesa',
  qr(amount, note='Aneesa Hampers Order'){
    const upiUrl=`upi://pay?pa=${this.id}&pn=${encodeURIComponent(this.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    return `https://chart.googleapis.com/chart?chs=220x220&cht=qr&chl=${encodeURIComponent(upiUrl)}&choe=UTF-8`;
  },
  link(amount, note='Aneesa Hampers Order'){
    return `upi://pay?pa=${this.id}&pn=${encodeURIComponent(this.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
  }
};
