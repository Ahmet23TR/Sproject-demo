# B2B Sipariş Yönetim Platformu – API Dokümantasyonu

## Genel Bilgiler

-   **Base URL:** `http://localhost:8080/api`
-   Tüm endpointler JSON formatında çalışır.
-   JWT gerektiren endpointlerde, header'da `Authorization: Bearer <token>` kullanılmalıdır.

## Sipariş Durum Sistemi (v2.0 - Sadeleştirilmiş)

Sistem, daha anlaşılır ve yönetimi kolay bir sipariş akışı için sadeleştirilmiştir:

### Üretim Durumları (`ProductionStatus`)

-   `PENDING` - Üretim Bekliyor
-   `COMPLETED` - Üretim Tamamlandı
-   `PARTIALLY_COMPLETED` - Kısmen Tamamlandı
    -   Kalem bazında: 0 < `producedQuantity` < `quantity` (kısmi üretim)
    -   Sipariş bazında: Bazı kalemler `CANCELLED`, bazıları `COMPLETED`
-   `CANCELLED` - Üretim İptal Edildi

### Teslimat Durumları (`OrderDeliveryStatus`)

-   `PENDING` - Üretim Bekliyor (Şoför listesinde görünmez)
-   `READY_FOR_DELIVERY` - Teslimata Hazır (Şoförün listesinde ama işlem yapılmadı)
-   `DELIVERED` - Teslim Edildi
-   `FAILED` - Teslim Edilemedi
-   `CANCELLED` - Teslimat İptal Edildi

### İş Akışı

1. **Sipariş Oluşturulduğunda:** `productionStatus: PENDING`, `deliveryStatus: PENDING`
2. **Şef En Az Bir Ürün Ürettikten Sonra:** `deliveryStatus: READY_FOR_DELIVERY` (driver listesinde görünür)
3. **Şef Tüm Ürünleri Tamamladığında:** `productionStatus: COMPLETED`, `deliveryStatus: READY_FOR_DELIVERY`
4. **Şoför Teslim Ettiğinde:** `deliveryStatus: DELIVERED` veya `FAILED` olur

**Not:** Ara durumlar (`IN_PROGRESS`, `OUT_FOR_DELIVERY`) kaldırılmıştır.

---

## 1. Authentication (Kullanıcı İşlemleri)

### 1.1. Login

-   **Endpoint:** `POST /auth/login`
-   **Body (Tercih Edilen):**
    ```json
    {
        "identifier": "kullanici@ornek.com",
        "password": "gizliSifre"
    }
    ```
-   **Body (Geri Uyumlu):**
    ```json
    {
        "email": "kullanici@ornek.com",
        "password": "gizliSifre"
    }
    ```
-   **Başarılı Yanıt:**
    ```json
    {
        "token": "<jwt_token>",
        "user": {
            "id": "...",
            "email": "...",
            "name": "...",
            "surname": "...",
            "phone": "+971500000001",
            "role": "CLIENT",
            "isActive": true,
            "productGroup": "SWEETS"
        }
    }
    ```
-   **Not:**
    -   `identifier` alanı email veya telefon numarası olabilir. Sistem otomatik olarak `@` içerip içermediğine göre email veya telefon olarak algılar.
    -   Telefon numarası E.164 formatında olmalıdır (örn: `+971500000001`).
    -   Eğer kullanıcı henüz admin tarafından onaylanmadıysa (isActive: false), login işlemi 403 Forbidden ve şu mesajla engellenir:
        ```json
        { "error": "Your account is not yet approved by the administrator." }
        ```
    -   Geçersiz format veya kimlik bilgileri için 401 döner:
        ```json
        { "error": "Invalid email/phone or password." }
        ```

---

### 1.2. Register (Herkese Açık, Admin Onayı Gerekir)

-   **Endpoint:** `POST /auth/register`
-   **Body:**
    ```json
    {
        "email": "yeni@ornek.com",
        "name": "Taner",
        "surname": "Türk",
        "password": "gizliSifre",
        "phone": "+971500000001",
        "address": "Dubai, UAE",
        "companyName": "Şirket Adı"
    }
    ```
-   **Başarılı Yanıt:**
    ```json
    {
        "message": "Registration successful, your account is waiting for admin approval.",
        "user": {
            "id": "...",
            "email": "...",
            "name": "...",
            "surname": "...",
            "phone": "+971500000001",
            "role": "CLIENT",
            "isActive": false,
            "productGroup": "SWEETS"
        }
    }
    ```
-   **Not:**
    -   Kayıt olan kullanıcı otomatik olarak `CLIENT` rolüyle ve `isActive: false` olarak oluşturulur.
    -   Kullanıcı sisteme giriş yapabilmek için admin tarafından aktif edilmelidir.
    -   `phone` alanı opsiyoneldir. Eğer gönderilirse E.164 formatında olmalıdır (örn: `+971500000001`).
    -   `address` ve `companyName` alanları opsiyoneldir.
    -   Geçersiz telefon formatı için 400 döner:
        ```json
        {
            "error": "Invalid phone number format. It should be (e.g. +971500000001) format."
        }
        ```

---

### 1.3. Kullanıcı Yönetimi (Sadece Admin)

-   Tüm endpointler `Authorization: Bearer <admin_token>` gerektirir.
-   Base path: `/users`
-   Endpointler:
    -   `GET /users` – Tüm kullanıcıları listele (query ile sayfalama/filtreleme desteklenir)
        -   **Başarılı Yanıt:**
            ```json
            {
                "data": [
                    {
                        "id": "...",
                        "email": "...",
                        "name": "...",
                        "surname": "...",
                        "phone": "+971500000001",
                        "role": "CLIENT",
                        "isActive": true,
                        "companyName": "Şirket Adı",
                        "address": "Dubai, UAE",
                        "productGroup": "SWEETS",
                        "createdAt": "2025-01-01T00:00:00.000Z"
                    }
                ],
                "pagination": {
                    "totalItems": 10,
                    "totalPages": 1,
                    "currentPage": 1,
                    "pageSize": 10
                }
            }
            ```
    -   `GET /users/:id` – Tek kullanıcıyı getir
    -   `POST /users` – Admin panelinden yeni kullanıcı oluştur
        -   **Body:**
            ```json
            {
                "email": "yeni@ornek.com",
                "name": "Taner",
                "surname": "Türk",
                "password": "gizliSifre",
                "phone": "+971500000001",
                "role": "CLIENT",
                "isActive": true,
                "address": "Dubai, UAE",
                "companyName": "Şirket Adı",
                "productGroup": "SWEETS"
            }
            ```
        -   **Validasyonlar:**
            -   Email benzersiz olmalıdır
            -   Telefon E.164 formatında olmalıdır (örn: `+971500000001`)
            -   Telefon benzersiz olmalıdır
            -   `productGroup` sadece `SWEETS` veya `BAKERY` olabilir (şefler için)
    -   `PUT /users/:id` – Kullanıcıyı güncelle
        -   **Body:**
            ```json
            {
                "email": "yeni@email.com",
                "phone": "+971500000002",
                "name": "Yeni İsim",
                "surname": "Yeni Soyisim",
                "role": "CLIENT",
                "isActive": true,
                "address": "Yeni Adres",
                "companyName": "Yeni Şirket",
                "productGroup": "BAKERY"
            }
            ```
        -   **Validasyonlar:**
            -   Email değişikliği varsa benzersizlik kontrolü yapılır
            -   Telefon değişikliği varsa format ve benzersizlik kontrolü yapılır
            -   `productGroup` sadece `SWEETS` veya `BAKERY` olabilir
        -   **Hata Durumları:**
            -   Email çakışması: `{ "error": "This email is already registered.", "status": 409 }`
            -   Telefon çakışması: `{ "error": "This phone number is already registered.", "status": 409 }`
            -   Geçersiz telefon formatı: `{ "error": "Invalid phone number format. It should be (e.g. +971500000001) format.", "status": 400 }`
            -   Geçersiz ürün grubu: `{ "error": "Invalid product group. Must be SWEETS or BAKERY.", "status": 400 }`
    -   `DELETE /users/:id` – Kullanıcıyı sil
    -   `PUT /users/:id/activate` – Kullanıcıyı aktif et
    -   `PUT /users/:id/deactivate` – Kullanıcıyı pasif et
    -   `PUT /users/:id/change-password` – Admin kullanıcının şifresini değiştirir

---

### 1.4. Profil (Giriş Yapmış Kullanıcı)

-   Base path: `/profile`
-   Endpointler:
    -   `GET /profile` – Kendi profilini getir
        -   **Başarılı Yanıt:**
            ```json
            {
                "id": "...",
                "email": "...",
                "name": "...",
                "surname": "...",
                "phone": "+971500000001",
                "role": "CLIENT",
                "isActive": true,
                "address": "Dubai, UAE",
                "companyName": "Şirket Adı",
                "productGroup": "SWEETS",
                "createdAt": "2025-01-01T00:00:00.000Z"
            }
            ```
    -   `PUT /profile` – Kendi profilini güncelle
        -   **Body:**
            ```json
            {
                "name": "Yeni İsim",
                "surname": "Yeni Soyisim",
                "email": "yeni@email.com",
                "phone": "+971500000002",
                "address": "Yeni Adres",
                "companyName": "Yeni Şirket",
                "productGroup": "BAKERY"
            }
            ```
        -   **Validasyonlar:**
            -   Email değişikliği varsa benzersizlik kontrolü yapılır
            -   Telefon değişikliği varsa format ve benzersizlik kontrolü yapılır
            -   Telefon E.164 formatında olmalıdır (örn: `+971500000001`)
            -   `productGroup` sadece `SWEETS` veya `BAKERY` olabilir (şefler için)
        -   **Hata Durumları:**
            -   Email çakışması: `{ "error": "This email is already registered.", "status": 409 }`
            -   Telefon çakışması: `{ "error": "This phone number is already registered.", "status": 409 }`
            -   Geçersiz telefon formatı: `{ "error": "Invalid phone number format. It should be (e.g. +971500000001) format.", "status": 400 }`
            -   Geçersiz ürün grubu: `{ "error": "Invalid product group. Must be SWEETS or BAKERY.", "status": 400 }`
    -   `POST /profile/change-password` – Kendi şifresini değiştir

---

## 2. Ürün (Product) İşlemleri

### 2.1. Ürün Oluşturma (Sadece Admin)

-   **Endpoint:** `POST /admin/products`
-   **Header:**  
    `Authorization: Bearer <admin_token>`
-   **Body:**
    ```json
    {
        "name": "Simit Sandviç",
        "description": "Geleneksel simit sandviç",
        "categoryId": "cat_123",
        "isActive": true,
        "imageUrl": "...",
        "basePrice": 20.0, // ZORUNLU: Ürünün temel fiyatı
        "unit": "PIECE",
        "optionGroups": [
            {
                "name": "Peynir Seçimi",
                "isRequired": true,
                "allowMultiple": false,
                "items": [
                    { "name": "Beyaz Peynir", "defaultPrice": 0 },
                    {
                        "name": "Kaşar Peyniri",
                        "defaultPrice": 5,
                        "multiplier": 1
                    }
                ]
            },
            {
                "name": "Tepsi Boyutu",
                "isRequired": false,
                "allowMultiple": false,
                "items": [
                    { "name": "Küçük", "defaultPrice": 0, "multiplier": 1 },
                    { "name": "Büyük", "defaultPrice": 0, "multiplier": 2 }
                ]
            }
        ]
    }
    ```
-   **Açıklama:**
    -   **`basePrice` zorunludur** ve ürün oluşturulurken mutlaka girilmelidir.
    -           -   Ürün oluşturulduktan sonra otomatik olarak "Default Price List"e eklenir.
    -   Opsiyon kalemlerinde fiyat alanı `defaultPrice`tır; ayrıca isteğe bağlı `multiplier` ile çarpan tanımlanabilir.
    -   Tüm opsiyon itemları da otomatik olarak default price liste `defaultPrice` değerleriyle eklenir.

**Örnek Response:**

```json
{
    "success": true,
    "message": "Product created successfully with base price",
    "data": {
        "id": "prod_123",
        "name": "Simit Sandviç",
        "basePrice": 20.0,
        "optionGroups": [...]
    }
}
```

---

### 2.2. Ürün Güncelleme (Sadece Admin)

-   **Endpoint:** `PUT /admin/products/:id`
-   **Header:**  
    `Authorization: Bearer <admin_token>`
-   **Body:** (Güncellenecek alanlar)
    ```json
    {
        "name": "Yeni Simit Sandviç",
        "description": "Açıklama",
        "categoryId": "cat_456",
        "isActive": false,
        "imageUrl": "...",
        "basePrice": 22.5,
        "unit": "TRAY"
    }
    ```

---

### 2.3. Admin – Ürün ve Opsiyon Yönetimi

-   Base path: `/admin/products`
-   `GET /admin/products` – Tüm ürünleri (aktif + pasif) listele
    -   **Query Parameters:**
        -   `page` (optional): Sayfa numarası (varsayılan: 1)
        -   `limit` (optional): Sayfa başına ürün sayısı (varsayılan: 10)
        -   `categoryId` (optional): Belirli bir kategoriye göre filtreleme
        -   `search` (optional): Ürün adında arama yapma (büyük/küçük harf duyarsız)
    -   **Örnek Kullanım:**
        -   `GET /admin/products` - Tüm ürünler
        -   `GET /admin/products?search=baklava` - "baklava" içeren ürünler
        -   `GET /admin/products?categoryId=cat_123&search=çikolata` - Belirli kategoride "çikolata" içeren ürünler
-   `GET /admin/products/:id` – Ürün detayını opsiyonlarıyla getir
-   `POST /admin/products/:id/image` – Ürün resmi yükle (multipart/form-data, field: `image`)
-   Option Group işlemleri:
    -   `POST /admin/products/:productId/option-groups` – Ürüne yeni option group ekle
    -   `PUT /admin/products/option-groups/:groupId` – Option group güncelle
    -   `DELETE /admin/products/option-groups/:groupId` – Option group sil
-   Option Item işlemleri:
    -   `POST /admin/products/option-groups/:groupId/items` – Option item ekle
    -   `PUT /admin/products/option-items/:itemId` – Option item güncelle
    -   `DELETE /admin/products/option-items/:itemId` – Option item sil
-   `DELETE /admin/products/:id` – Ürün sil

---

### 2.4. Ürünleri ve Opsiyonlarını Listeleme (Public)

-   **Endpoint:** `GET /products`
-   **Query Parameters:**
    -   `page` (optional): Sayfa numarası (varsayılan: 1)
    -   `limit` (optional): Sayfa başına ürün sayısı (varsayılan: 10)
    -   `categoryId` (optional): Belirli bir kategoriye göre filtreleme
    -   `search` (optional): Ürün adında arama yapma (büyük/küçük harf duyarsız)
-   **Açıklama:**  
    Tüm aktif ürünler, iç içe opsiyon grupları ve opsiyon kalemleriyle birlikte listelenir. Opsiyon kalemlerinde `price` ve varsa `multiplier` alanları bulunur. Arama parametresi ile ürün adında filtreleme yapılabilir.
-   **Örnek Kullanım:**
    -   `GET /products` - Tüm ürünler
    -   `GET /products?search=baklava` - "baklava" içeren ürünler
    -   `GET /products?categoryId=cat_123&search=çikolata` - Belirli kategoride "çikolata" içeren ürünler
    -   `GET /products?page=2&limit=5&search=tatlı` - Sayfa 2'de, sayfa başına 5 ürün, "tatlı" içeren ürünler
-   **Örnek Yanıt:**
    ```json
    {
        "products": [
            {
                "id": "prod_123",
                "name": "Simit Sandviç",
                "description": "...",
                "imageUrl": "...",
                "optionGroups": [
                    {
                        "id": "grp_1",
                        "name": "Peynir Seçimi",
                        "isRequired": true,
                        "allowMultiple": false,
                        "items": [
                            {
                                "id": "opt_1",
                                "name": "Beyaz Peynir",
                                "price": 0
                            },
                            {
                                "id": "opt_2",
                                "name": "Kaşar Peyniri",
                                "price": 5
                            }
                        ]
                    }
                ]
            }
        ]
    }
    ```

---

### 2.5. Kategorileri Listeleme (Public)

-   **Endpoint:** `GET /products/categories`
-   **Açıklama:**  
    Tüm kategorileri, alt kategorilerini ve her kategorideki aktif ürünlerin listesini döner.

---

### 2.6. Ürün Detayı (Public)

-   **Endpoint:** `GET /products/:id`
-   **Açıklama:**  
    Tek ürün ve opsiyonlarının detaylarını (fiyatlar ve `multiplier` dahil) döner.

---

### 2.7. Ürün İstatistikleri (Admin)

-   **Endpoint:** `GET /admin/products/statistics`
-   **Auth:** Admin JWT gerekli
-   **Başarılı Yanıt:**
    ```json
    {
        "success": true,
        "message": "Product statistics fetched successfully",
        "data": {
            "totalProducts": 350,
            "activeProducts": 316,
            "inactiveProducts": 34,
            "topSellingProduct": {
                "id": "product_123",
                "name": "Chocolate Cake",
                "salesCount": 245
            },
            "topSellingProductByRevenue": {
                "id": "product_456",
                "name": "Premium Baklava",
                "totalRevenue": 15750.5
            }
        }
    }
    ```
-   **Açıklama:**
    -   `totalProducts`: Silinen ürünler hariç toplam ürün sayısı (aktif + pasif)
    -   `activeProducts`: Aktif durumda olan ürün sayısı
    -   `inactiveProducts`: Pasif durumda olan ürün sayısı
    -   `topSellingProduct`: Son 30 günde en çok sipariş edilen ürün (adet bazında)
        -   SQL Query: `order_items` tablosundan `productId` gruplandırılarak `SUM(quantity)` hesaplanır
    -   `topSellingProductByRevenue`: Son 30 günde en çok gelir getiren ürün (fiyat bazında)
        -   SQL Query: `order_items` tablosundan `productId` gruplandırılarak `SUM(totalPrice)` hesaplanır
    -   Eğer son 30 günde hiç sipariş yoksa her iki `topSelling` alanı da null döner

---

## 3. Sipariş (Order) İşlemleri

### 3.0. Fiyatlandırma Modeli (initialTotalAmount, finalTotalAmount)

-   `initialTotalAmount`: Sipariş oluşturulduğu andaki toplam tutarın anlık görüntüsü (snapshot). Tarihsel fiyat bütünlüğü için saklanır.
-   `finalTotalAmount`: Teslimat durumuna göre hesaplanan nihai tutar. Teslimat durumlarına göre farklı hesaplama mantığı uygulanır.
-   **Hesaplama mantığı (güncellenmiş):**
    -   `PENDING`: Sipariş henüz teslimata hazır değil → `finalTotalAmount = initialTotalAmount`
    -   `DELIVERED`: Tam teslim edildi → Tam miktar için ödeme (`quantity * unitPrice`)
    -   `PARTIAL`: Kısmi teslim → Sadece teslim edilen miktar için ödeme (`deliveredQuantity * unitPrice`)
    -   `FAILED`/`CANCELLED`: Teslim edilemedi veya iptal edildi → Ödeme yok (0)
    -   `READY_FOR_DELIVERY`: Henüz teslim edilmedi → Ödeme yok (0)
    -   **ÖNEMLİ:** Sadece gerçekten teslim edilen ürünler için ödeme yapılır.

### 3.1. Sipariş Oluşturma (Sadece Müşteri)

-   **Endpoint:** `POST /orders`
-   **Header:**  
    `Authorization: Bearer <client_token>`
-   **Body:**
    ```json
    {
        "items": [
            {
                "productId": "prod_123",
                "quantity": 2,
                "selectedOptionItemIds": ["opt_1", "opt_5"]
            }
        ],
        "notes": "Lütfen sıcak gönderin."
    }
    ```
-   **Açıklama:**
    -   Fiyat hesaplamasında ürün `basePrice` + seçili opsiyonların `price` toplamı alınır ve varsa `multiplier` uygulanır.
    -   Sipariş oluşturulduğunda `initialTotalAmount` ve `finalTotalAmount` aynı değere set edilir (o anki sepet toplamı).
    -   `finalTotalAmount`, teslimat akışı sonunda (DELIVERED / PARTIALLY_DELIVERED / FAILED) otomatik yeniden hesaplanır.

---

### 3.2. Kendi Siparişlerini Listeleme (Müşteri)

-   **Endpoint:** `GET /orders`
-   **Header:**  
    `Authorization: Bearer <client_token>`

---

### 3.3. Sipariş Detayını Getirme (Admin veya Sahibi)

-   **Endpoint:** `GET /orders/:orderId`
-   **Header:**  
    `Authorization: Bearer <ilgili_token>`

---

## 4. Favori Ürünler (Favorite Products)

### 4.1. Favori Ürünleri Listele

-   **Endpoint:** `GET /favorites`
-   **Auth:** Bearer Token (CLIENT role gerekli)

### 4.2. Ürünü Favorilere Ekle

-   **Endpoint:** `POST /favorites`
-   **Auth:** Bearer Token (CLIENT role gerekli)
-   **Body:**
    ```json
    { "productId": "product_id" }
    ```

### 4.3. Ürünü Favorilerden Kaldır

-   **Endpoint:** `DELETE /favorites/:productId`
-   **Auth:** Bearer Token (CLIENT role gerekli)

### 4.4. Ürünün Favori Durumunu Kontrol Et

-   **Endpoint:** `GET /favorites/check/:productId`
-   **Auth:** Bearer Token (CLIENT role gerekli)

### 4.5. Favori Sayısını Getir

-   **Endpoint:** `GET /favorites/count`
-   **Auth:** Bearer Token (CLIENT role gerekli)

---

## 5. Sepet (Cart) İşlemleri

-   Tüm endpointler `Authorization: Bearer <client_token>` gerektirir.
-   Base path: `/cart`
-   Endpointler:
    -   `GET /cart` – Sepeti getir
    -   `POST /cart/items` – Sepete ürün ekle/güncelle
        -   Body: `{ "productId": "...", "quantity": 2, "selectedOptionItemIds": ["opt_1", "opt_2"] }`
    -   `PUT /cart/items/:id` – Sepet kalemi adet güncelle
        -   Body: `{ "quantity": 3 }`
    -   `DELETE /cart/items/:id` – Sepet kalemini sil (204 döner)
    -   `POST /cart/merge` – Misafir sepetini kullanıcı sepetiyle birleştir
        -   Body: `{ "items": [{ "productId": "...", "quantity": 1, "selectedOptionItemIds": ["..."] }] }`

---

## 6. Admin Endpointleri

-   Tüm endpointler `Authorization: Bearer <admin_token>` gerektirir.
-   Base path: `/admin`
-   Endpointler:

    -   `GET /admin/orders` – **[YENİ]** Gelişmiş filtreleme ile tüm siparişleri listele

        -   **Query Parameters:**
            -   `page` (opsiyonel): Sayfa numarası (default: 1)
            -   `limit` (opsiyonel): Sayfa boyutu (default: 10, max: 100)
            -   `status` (opsiyonel): Sipariş durumu filtresi
                -   Geçerli değerler: `PENDING`, `READY_FOR_DELIVERY`, `DELIVERED`, `FAILED`, `CANCELLED`, `PARTIALLY_DELIVERED`
            -   `dateFilter` (opsiyonel): Tarih filtresi
                -   Geçerli değerler: `TODAY`, `THIS_WEEK`, `LAST_WEEK`, `THIS_MONTH`, `LAST_MONTH`, `THIS_YEAR`, `LAST_YEAR`, `CUSTOM`
            -   `startDate` (opsiyonel): Başlangıç tarihi (YYYY-MM-DD formatında, `dateFilter=CUSTOM` ile kullanılır)
            -   `endDate` (opsiyonel): Bitiş tarihi (YYYY-MM-DD formatında, `dateFilter=CUSTOM` ile kullanılır)
            -   `search` (opsiyonel): Arama terimi (müşteri adı, email, şirket adı, sipariş numarasında arar)
            -   `sortBy` (opsiyonel): Sıralama alanı (default: `createdAt`)
                -   Geçerli değerler: `createdAt`, `orderNumber`, `totalAmount`, `customerName`
            -   `sortOrder` (opsiyonel): Sıralama yönü (default: `desc`)
                -   Geçerli değerler: `asc`, `desc`
        -   **Örnek API Çağrıları:**

            ```bash
            # Tüm siparişler (sayfa 1, 10 adet)
            GET /admin/orders?page=1&limit=10

            # Status filtresi
            GET /admin/orders?status=PENDING&page=1&limit=10

            # Tarih filtresi
            GET /admin/orders?dateFilter=THIS_WEEK&page=1&limit=10

            # Custom tarih aralığı
            GET /admin/orders?dateFilter=CUSTOM&startDate=2024-01-01&endDate=2024-01-31&page=1&limit=10

            # Arama
            GET /admin/orders?search=john%20doe&page=1&limit=10

            # Kombinasyon
            GET /admin/orders?status=DELIVERED&dateFilter=THIS_MONTH&search=acme&sortBy=createdAt&sortOrder=desc&page=1&limit=10
            ```

        -   **Response Format:**
            ```json
            {
              "success": true,
              "message": "Orders fetched successfully",
              "data": [
                {
                  "id": "order_123",
                  "orderNumber": "ORD-202412-ABC123",
                  "createdAt": "2024-12-01T10:00:00.000Z",
                  "productionStatus": "COMPLETED",
                  "deliveryStatus": "DELIVERED",
                  "finalTotalAmount": 150.75,
                  "user": {
                    "id": "user_456",
                    "name": "John",
                    "surname": "Doe",
                    "email": "john@company.com",
                    "companyName": "ACME Corp"
                  },
                  "items": [...]
                }
              ],
              "pagination": {
                "currentPage": 1,
                "totalPages": 5,
                "totalItems": 45,
                "pageSize": 10,
                "hasNextPage": true,
                "hasPrevPage": false
              },
              "filters": {
                "appliedFilters": {
                  "status": "DELIVERED",
                  "dateFilter": "THIS_MONTH",
                  "search": "acme",
                  "sortBy": "createdAt",
                  "sortOrder": "desc"
                },
                "availableFilters": {
                  "statuses": [
                    { "value": "PENDING", "label": "Bekliyor", "count": 12 },
                    { "value": "READY_FOR_DELIVERY", "label": "Teslimata Hazır", "count": 8 },
                    { "value": "DELIVERED", "label": "Teslim Edildi", "count": 25 },
                    { "value": "PARTIALLY_DELIVERED", "label": "Kısmi Teslim", "count": 3 },
                    { "value": "FAILED", "label": "Başarısız", "count": 2 },
                    { "value": "CANCELLED", "label": "İptal Edildi", "count": 1 }
                  ]
                }
              }
            }
            ```

    -   `GET /admin/orders/legacy` – Eski tüm siparişleri listele (geriye uyumluluk için, opsiyonel `startDate`, `endDate`)
    -   `GET /admin/orders/:userId?page=1&limit=10` – Belirli kullanıcının siparişlerini sayfalı listele
        -   **Query Parameters:**
            -   `page` (opsiyonel): Sayfa numarası (default: 1)
            -   `limit` (opsiyonel): Sayfa boyutu (default: 10)
        -   **Response Format:**
            ```json
            {
              "success": true,
              "message": "User orders fetched successfully",
              "data": [
                {
                  "id": "order_123",
                  "orderNumber": "ORD-202412-ABC123",
                  "createdAt": "2024-12-01T10:00:00.000Z",
                  "productionStatus": "COMPLETED",
                  "deliveryStatus": "DELIVERED",
                  "finalTotalAmount": 150.75,
                  "items": [...]
                }
              ],
              "pagination": {
                "totalItems": 45,
                "totalPages": 5,
                "currentPage": 1,
                "pageSize": 10
              }
            }
            ```
    -   `PUT /admin/orders/:orderId/cancel` – **[YENİ]** Siparişi iptal et (Admin yetkisi gerekli)
        -   **Açıklama:** Sadece `PENDING` ve `READY_FOR_DELIVERY` durumundaki siparişleri iptal edebilir
        -   **Body:**
            ```json
            {
                "notes": "Müşteri isteği üzerine iptal edildi"
            }
            ```
        -   **Validasyon:**
            -   `notes` zorunlu ve minimum 5 karakter olmalı
            -   Sipariş durumu `PENDING` veya `READY_FOR_DELIVERY` olmalı
        -   **İşlem Süreci:**
            1. Siparişin durumu kontrol edilir
            2. Tüm sipariş kalemleri `CANCELLED` olarak işaretlenir
            3. Sipariş `deliveryStatus: CANCELLED`, `productionStatus: CANCELLED` olur
            4. `producedQuantity` ve `deliveredQuantity` sıfırlanır
            5. Activity log'a kaydedilir
            6. Fiyat hesaplaması güncellenir (iptal edilen siparişlerin tutarı 0 olur)
        -   **Başarılı Yanıt:**
            ```json
            {
                "success": true,
                "message": "Order cancelled successfully",
                "data": {
                    "id": "order_123",
                    "orderNumber": "ORD-202412-ABC123",
                    "deliveryStatus": "CANCELLED",
                    "productionStatus": "CANCELLED",
                    "finalTotalAmount": 0,
                    "items": [
                        {
                            "id": "item_456",
                            "productionStatus": "CANCELLED",
                            "deliveryStatus": "CANCELLED",
                            "producedQuantity": 0,
                            "deliveredQuantity": 0,
                            "notes": "Müşteri isteği üzerine iptal edildi"
                        }
                    ]
                }
            }
            ```
        -   **Hata Durumları:**
            ```json
            {
                "success": false,
                "message": "Order cannot be cancelled. Current status: DELIVERED. Only orders with status PENDING or READY_FOR_DELIVERY can be cancelled."
            }
            ```
    -   `GET /admin/dashboard-stats` – Dashboard istatistikleri
        -   Not: Toplam ciro hesabı `finalTotalAmount` üzerinden yapılır.
    -   `GET /admin/production-list/all` – Günlük tam üretim listesi (tamamlanan + tamamlanmayan)
    -   `GET /admin/logs?page=&limit=` – Aktivite loglarını sayfalı listele
    -   **Şef Ürün Grubu Yönetimi:**
        -   `GET /admin/chefs` – Tüm şefleri listele (ürün grupları ile birlikte)
            -   **Başarılı Yanıt:**
                ```json
                {
                    "chefs": [
                        {
                            "id": "...",
                            "name": "Ahmet",
                            "surname": "Şef",
                            "email": "ahmet@example.com",
                            "role": "CHEF",
                            "productGroup": "SWEETS",
                            "isActive": true,
                            "createdAt": "2025-01-01T00:00:00.000Z"
                        }
                    ]
                }
                ```
        -   `GET /admin/chefs/:chefId/product-group` – Belirli şefin ürün grubunu getir
            -   **Başarılı Yanıt:**
                ```json
                {
                    "chef": {
                        "id": "...",
                        "name": "Ahmet",
                        "surname": "Şef",
                        "email": "ahmet@example.com",
                        "productGroup": "SWEETS"
                    }
                }
                ```
        -   `PUT /admin/chefs/:chefId/product-group` – Şefin ürün grubunu güncelle
            -   **Body:**
                ```json
                {
                    "productGroup": "BAKERY"
                }
                ```
            -   **Validasyonlar:**
                -   `productGroup` sadece `SWEETS` veya `BAKERY` olabilir
                -   Şef bulunamazsa `USER_NOT_FOUND` hatası
            -   **Hata Durumları:**
                -   Geçersiz ürün grubu: `{ "error": "Invalid product group. Must be SWEETS or BAKERY.", "status": 400 }`
                -   Şef bulunamadı: `{ "error": "Chef not found", "status": 404 }`

### 6.4. Customer Statistics API

Admin dashboard için müşteri istatistiklerini döndürür:

-   `GET /admin/customers/statistics?period=THIS_WEEK|THIS_MONTH|LAST_30_DAYS`

**Query Parameters:**

-   `period` (opsiyonel): İstatistik dönemi
    -   `THIS_WEEK` - Bu hafta vs geçen hafta
    -   `THIS_MONTH` - Bu ay vs geçen ay
    -   `LAST_30_DAYS` - Son 30 gün vs önceki 30 gün (default)

**Response Format:**

```json
{
    "success": true,
    "message": "Customer statistics fetched successfully",
    "data": {
        "totalCustomers": 150,
        "activeCustomers": 45,
        "inactiveCustomers": 105,
        "newCustomers": 12,
        "previousPeriod": {
            "totalCustomers": 138,
            "activeCustomers": 38,
            "inactiveCustomers": 100,
            "newCustomers": 8
        }
    }
}
```

**Açıklamalar:**

-   `totalCustomers`: Toplam müşteri sayısı (aktif hesaplar)
-   `activeCustomers`: Belirtilen dönemde sipariş veren müşteriler
-   `inactiveCustomers`: Dönemde sipariş vermeyenler + deaktive hesaplar
-   `newCustomers`: Belirtilen dönemde kayıt olan yeni müşteriler
-   `previousPeriod`: Karşılaştırma için önceki dönemin verileri

### 6.5. Additional Customer APIs

#### Users List with Order Statistics

-   `GET /api/users?role=CLIENT&page=1&limit=10&includeStats=true`

**Query Parameters:**

-   `role` (opsiyonel): Kullanıcı rolü filtresi (CLIENT, ADMIN, CHEF, DRIVER)
-   `page` (opsiyonel): Sayfa numarası (default: 1)
-   `limit` (opsiyonel): Sayfa boyutu (default: 10)
-   `includeStats` (opsiyonel): Order istatistiklerini dahil et (true/false)

#### Single User with Order Statistics

-   `GET /api/users/:id?includeStats=true`

**Query Parameters:**

-   `includeStats` (opsiyonel): Order istatistiklerini dahil et (true/false)

**Response Format with Statistics:**

```json
{
    "success": true,
    "message": "User fetched successfully",
    "data": {
        "id": "u_123",
        "name": "Janet",
        "surname": "Adebayo",
        "email": "janet@mail.com",
        "phone": "+971500000001",
        "companyName": "Sunrise LLC",
        "isActive": true,
        "createdAt": "2024-03-12T08:25:00.000Z",
        "orderCount": 18,
        "totalOrderAmount": 9250.5
    }
}
```

**Response Format without Statistics:**

```json
{
    "success": true,
    "message": "User fetched successfully",
    "data": {
        "id": "u_123",
        "name": "Janet",
        "surname": "Adebayo",
        "email": "janet@mail.com",
        "phone": "+971500000001",
        "companyName": "Sunrise LLC",
        "isActive": true,
        "createdAt": "2024-03-12T08:25:00.000Z"
    }
}
```

**Response Format with Statistics:**

```json
{
    "success": true,
    "message": "Users fetched successfully",
    "data": [
        {
            "id": "u_123",
            "name": "Janet",
            "surname": "Adebayo",
            "email": "janet@mail.com",
            "phone": "+971500000001",
            "companyName": "Sunrise LLC",
            "isActive": true,
            "createdAt": "2024-03-12T08:25:00.000Z",
            "orderCount": 18,
            "totalOrderAmount": 9250.5
        }
    ],
    "pagination": {
        "totalItems": 200,
        "totalPages": 20,
        "currentPage": 1,
        "pageSize": 10
    }
}
```

#### Customer Summary Statistics

-   `GET /api/admin/analytics/customers/summary`
-   `GET /api/users/stats` (alternatif endpoint)

**Response Format:**

```json
{
    "success": true,
    "message": "Customer summary fetched successfully",
    "data": {
        "totalCustomers": 1250,
        "activeCustomers": 1180,
        "inactiveCustomers": 70
    }
}
```

**Açıklamalar:**

-   `totalCustomers`: Toplam CLIENT rolündeki aktif kullanıcı sayısı
-   `activeCustomers`: Aktif (isActive: true) müşteri sayısı
-   `inactiveCustomers`: Deaktive edilmiş (isActive: false) müşteri sayısı

---

## 7. Chef (Üretim) Endpointleri

-   Tüm endpointler `Authorization: Bearer <chef_or_admin_token>` gerektirir.
-   Base path: `/chef`
-   Endpointler:
    -   `GET /chef/production-list` – Günlük üretim özetini getir (sadece `PENDING` kalemler; partial üretilen ürünler gösterilmez)
    -   `GET /chef/production-list-by-group` – Şefin ürün grubuna göre üretim listesini getir (sadece şefin uzmanlık alanındaki ürünler)
        -   Query Param: `date` (opsiyonel, default: bugün)
        -   **Açıklama:** Şefin `productGroup` alanına göre filtrelenmiş üretim listesi döner
        -   **Örnek:** Tatlı şefi sadece `SWEETS` grubundaki ürünleri, bakery şefi sadece `BAKERY` grubundaki ürünleri görür
    -   `GET /chef/orders` – Günün siparişlerini getir (opsiyonel `date`)
    -   `PUT /chef/order-items/:orderItemId/status` – Üretim durumunu ayarla
        -   Body: `{ "status": "PENDING|COMPLETED|CANCELLED", "notes": "..." }`
        -   Status enum değerleri: `ProductionStatus.PENDING`, `ProductionStatus.COMPLETED`, `ProductionStatus.CANCELLED`, `ProductionStatus.PARTIALLY_COMPLETED`
        -   Kurallar:
            -   Eğer kalem kısmen üretilmişse (`0 < producedQuantity < quantity`), manuel olarak `COMPLETED` veya `CANCELLED` yapılamaz. Tamamlama sadece `produce` endpoint'i ile olabilir.
        -   **Otomatik İş Mantığı:**
            -   Tüm kalemler `COMPLETED` ise → Sipariş: `productionStatus: COMPLETED`, `deliveryStatus: READY_FOR_DELIVERY`
            -   Bazı kalemler `COMPLETED`, bazıları `CANCELLED` ise → Sipariş: `productionStatus: PARTIALLY_COMPLETED`, `deliveryStatus: READY_FOR_DELIVERY`
            -   Tüm kalemler `CANCELLED` ise → Sipariş: `productionStatus: CANCELLED`, `deliveryStatus: CANCELLED`
    -   `PUT /chef/order-items/:orderItemId/produce` – Kısmi üretim ekle
        -   Body: `{ "amount": 5, "notes": "..." }`
        -   Kurallar/Validasyon:
            -   `amount` pozitif tam sayı olmalı; aksi durumda 400 döner.
            -   `notes` zorunludur; trim edildikten sonra en az 5 karakter olmalıdır. Aksi durumda 400 döner.
        -   Sunucu davranışı:
            -   `producedQuantity` alanı `amount` kadar artırılır.
            -   `productionStatus` otomatik güncellenir:
                -   `producedQuantity === 0` → `ProductionStatus.PENDING`
                -   `0 < producedQuantity < quantity` → `ProductionStatus.PARTIALLY_COMPLETED`
                -   `producedQuantity === quantity` → `ProductionStatus.COMPLETED`
            -   **Garanti:** Response'ta `orderItem.productionStatus` her zaman güncel değeri içerir
            -   `productionNotes` alanı gönderilen (trim'lenmiş) `notes` ile güncellenir.
            -   `processedByUserId` ve `processedAt` sunucu tarafından set edilir.
            -   **Sipariş durumu otomatik güncellenir** (yukarıdaki iş mantığına göre).
        -   Hata durumları örnekleri:
            -   Toplam üretim, kalem `quantity` değerini aşarsa 400: "Üretim miktarı toplam adedi aşamaz."
            -   `COMPLETED` veya `CANCELLED` kaleme üretim eklenemez; 400 döner.

---

## 8. Driver (Teslimat) Endpointleri

-   Tüm endpointler `Authorization: Bearer <driver_token>` gerektirir.
-   Base path: `/driver`
-   Endpointler:
    -   `GET /driver/orders?date=&status=` – Şoförün teslimatlarını listele
        -   **Varsayılan davranış:** `status` parametresi verilmezse, sadece `READY_FOR_DELIVERY` durumundaki siparişler getirilir.
        -   **Tarih filtresi davranışı:**
            -   `DELIVERED`, `PARTIALLY_DELIVERED`, `FAILED` gibi tamamlanmış teslimat statüleri için ilgili gün filtresi `deliveredAt` alanına göre yapılır.
            -   Diğer statüler için tarih filtresi `createdAt` alanına göre yapılır.
            -   Birden fazla statü birlikte gönderilirse (ör. `status[]=READY_FOR_DELIVERY&status[]=DELIVERED`), her grup kendi ilgili tarih alanıyla OR mantığıyla birleştirilir.
        -   **Değişiklik:** Artık `PENDING` ve `OUT_FOR_DELIVERY` durumları bulunmaz.
    -   `GET /driver/orders/:orderId` – Sipariş detayını getir
    -   `PUT /driver/orders/:orderId/status` – Teslimat durumunu güncelle
        -   Body: `{ "status": "DELIVERED|FAILED", "notes": "..." }`
        -   **Değişiklik:** Artık sadece `DELIVERED` veya `FAILED` durumları kullanılır. `PENDING`, `IN_TRANSIT` durumları kaldırıldı.
        -   **İş Mantığı:**
            -   `FAILED` durumu için `notes` zorunludur (teslim edilememe sebebi).
            -   `DELIVERED` durumunda `notes` opsiyoneldir.
            -   **YENİ:** `DELIVERED` durumu gönderildiğinde, sistem otomatik olarak sipariş kalemlerinin üretim durumlarını kontrol eder:
                -   Eğer herhangi bir kalem partial olarak üretilmişse (`0 < producedQuantity < quantity`) → `PARTIALLY_DELIVERED` olarak kaydedilir
                -   Aksi takdirde → `DELIVERED` olarak kaydedilir
            -   **YENİ:** Nihai fiyat otomatik hesaplanır: Siparişin `finalTotalAmount` değeri, sadece teslim edilen miktarların parasal değeri olarak güncellenir.
    -   `PUT /driver/order-items/:orderItemId/deliver` – Kısmi teslimat ekle (kalem bazında)
        -   Body: `{ "amount": 3, "notes": "..." }`
        -   Kurallar/Validasyon:
            -   `amount` pozitif tam sayı olmalı; aksi durumda 400 döner.
            -   `notes` zorunludur; trim edildikten sonra en az 5 karakter olmalıdır. Aksi durumda 400 döner.
        -   Sunucu davranışı:
            -   `deliveredQuantity` alanı `amount` kadar artırılır.
            -   `deliveryStatus` otomatik güncellenir: kalan > 0 ise `PARTIAL`, eşitse `DELIVERED`.
            -   `deliveryNotes` alanı gönderilen (trim'lenmiş) `notes` ile güncellenir.
            -   `deliveredByUserId` ve `deliveredAt` sunucu tarafından set edilir.
            -   **YENİ:** Siparişin `finalTotalAmount` değeri, bu değişikliklerden sonra otomatik yeniden hesaplanır (sadece teslim edilen miktarların toplam tutarı).
        -   Hata durumları örnekleri:
            -   Toplam teslimat, kalem `quantity` değerini aşarsa 400.
            -   `DELIVERED` veya `CANCELLED` kaleme teslimat eklenemez; 400 döner.

---

## 9. Distributor (Bayi) Endpointleri

-   Tüm endpointler `Authorization: Bearer <distributor_token>` (veya admin tokenı) gerektirir.
-   Base path: `/distributor`
-   Bu rol yalnızca günlük özet endpointini tüketebilir; veri üzerinde değişiklik yapamaz.
-   Endpointler:
    -   `GET /distributor/daily-client-summary?date=YYYY-MM-DD`
        -   `date` query parametresi zorunludur ve `YYYY-MM-DD` formatında olmalıdır.
        -   Belirtilen gün içinde oluşturulan ve teslimat durumu `CANCELLED` olmayan siparişler dikkate alınır.
        -   Response örneği:

```json
{
  "date": "2025-10-26",
  "dailySummary": {
    "totalClients": 5,
    "totalOrders": 12,
    "grandTotalRevenue": 3500
  },
  "clientSummaries": [
    {
      "clientId": "clt_123",
      "clientName": "Mega Mart",
      "clientAddress": "123 Market St, City, Country",
      "clientPhoneNumber": "+971501234567",
      "numberOfOrders": 3,
      "clientDailyTotal": 850
    }
  ]
}
```

        -   Sipariş bulunamazsa 200 statü kodu ile boş liste ve 0 değerleri dönülür.
        -   Hata durumları:
            -   `date` eksik veya formatı hatalı → 400
            -   Token yok/geçersiz → 401/403

    -   `GET /distributor/daily-product-summary?date=YYYY-MM-DD`
        -   `date` query parametresi zorunludur ve `YYYY-MM-DD` formatında olmalıdır.
        -   Belirtilen gün içinde oluşturulan ve teslimat durumu `CANCELLED` olmayan siparişler dikkate alınır.
        -   **Önemli:** Ürün + seçilen opsiyonlar kombinasyonu bazında gruplandırılmış özet döner.
        -   **Gruplama Kuralı:** Aynı ürün + aynı opsiyonlar = tek satır, farklı opsiyonlar = ayrı satırlar.
        -   Response örneği:

```json
{
  "date": "2025-10-22",
  "dailySummary": {
    "totalProducts": 4,
    "totalQuantity": 155,
    "grandTotalAmount": 8750.00
  },
  "productSummaries": [
    {
      "productId": "prod_123",
      "productName": "Baklava",
      "productUnit": "kg",
      "totalQuantity": 50,
      "totalAmount": 2500.00,
      "optionGroups": [
        {
          "optionGroupId": "opt_grp_1",
          "optionGroupName": "Boyut Seçimi",
          "isRequired": true,
          "allowMultiple": false,
          "selectedItems": [
            {
              "optionItemId": "opt_item_1",
              "optionItemName": "Büyük Tepsi",
              "defaultPrice": 15.00,
              "multiplier": 2.0
            }
          ]
        }
      ]
    },
    {
      "productId": "prod_123",
      "productName": "Baklava",
      "productUnit": "kg",
      "totalQuantity": 30,
      "totalAmount": 1200.00,
      "optionGroups": [
        {
          "optionGroupId": "opt_grp_1",
          "optionGroupName": "Boyut Seçimi",
          "isRequired": true,
          "allowMultiple": false,
          "selectedItems": [
            {
              "optionItemId": "opt_item_2",
              "optionItemName": "Küçük Tepsi",
              "defaultPrice": 8.00,
              "multiplier": 1.0
            }
          ]
        }
      ]
    },
    {
      "productId": "prod_124",
      "productName": "Künefe",
      "productUnit": "portion",
      "totalQuantity": 75,
      "totalAmount": 3750.00,
      "optionGroups": []
    }
  ]
}
```

**Gruplama Açıklaması:**
- Aynı ürün (Baklava) farklı opsiyonlarla sipariş edilmiş → 2 ayrı satır
- Büyük Tepsi Baklava: 50kg, 2500 TL
- Küçük Tepsi Baklava: 30kg, 1200 TL  
- Künefe opsiyonsuz: 75 portion, 3750 TL

        -   Sipariş bulunamazsa 200 statü kodu ile boş liste ve 0 değerleri dönülür.
        -   Hata durumları:
            -   `date` eksik veya formatı hatalı → 400
            -   Token yok/geçersiz → 401/403

    -   `GET /distributor/daily-orders?date=YYYY-MM-DD`
        -   `date` query parametresi zorunludur ve `YYYY-MM-DD` formatında olmalıdır.
        -   Belirtilen gün içinde oluşturulan ve teslimat durumu `CANCELLED` olmayan siparişler dikkate alınır.
        -   Tüm sipariş detayları ile birlikte müşteri, ürün ve opsiyon bilgilerini döner.
        -   Response örneği:

```json
{
  "date": "2025-10-22",
  "summary": {
    "totalOrders": 12,
    "totalAmount": 7851.00
  },
  "orders": [
    {
      "id": "order_123",
      "orderNumber": "ORD-202410-ABC123",
      "createdAt": "2025-10-22T08:30:00.000Z",
      "notes": "Please deliver before 2 PM",
      "initialTotalAmount": 2500.00,
      "finalTotalAmount": 2500.00,
      "productionStatus": "COMPLETED",
      "deliveryStatus": "READY_FOR_DELIVERY",
      "deliveryNotes": null,
      "user": {
        "id": "user_456",
        "name": "Ahmed",
        "surname": "Ali",
        "companyName": "Mega Mart",
        "email": "ahmed@megamart.com",
        "address": "123 Main St, Dubai"
      },
      "items": [
        {
          "id": "item_789",
          "quantity": 50,
          "unitPrice": 50.00,
          "totalPrice": 2500.00,
          "productionStatus": "COMPLETED",
          "producedQuantity": 50,
          "productionNotes": null,
          "product": {
            "id": "prod_123",
            "name": "Baklava",
            "unit": "KG",
            "productGroup": "SWEETS"
          },
          "selectedOptions": [
            {
              "optionItem": {
                "id": "opt_item_1",
                "name": "Büyük Tepsi",
                "defaultPrice": 0.00,
                "multiplier": 2.0
              }
            }
          ],
          "deliveredQuantity": 50,
          "deliveryStatus": "DELIVERED",
          "deliveryNotes": null,
          "deliveredAt": "2025-10-22T14:30:00.000Z"
        }
      ],
      "attachmentUrl": null,
      "deliveredByUser": {
        "name": "Mahmoud",
        "surname": "Hassan"
      },
      "deliveredAt": "2025-10-22T14:30:00.000Z"
    }
  ]
}
```

        -   Sipariş bulunamazsa 200 statü kodu ile boş liste ve 0 değerleri dönülür.
        -   Sıralama: Oluşturulma zamanına göre artan sıralama (en eski en üstte).
        -   Hata durumları:
            -   `date` eksik veya formatı hatalı → 400
            -   Token yok/geçersiz → 401/403

---

## 10. Şef Ürün Grubu Sistemi

### 10.1. Genel Bakış

Şeflere ürün grubu alanı eklenmiştir. Bu özellik sayesinde şefler sadece kendi uzmanlık alanlarındaki ürünleri görebilir ve işleyebilir. Bazı şefler tatlı ürünlerini, bazıları ise bakery ürünlerini üretir.

### 10.2. Ürün Grupları

-   **SWEETS** - Tatlı ürünleri (default değer)
-   **BAKERY** - Fırın ürünleri

### 10.3. Özellikler

-   **Admin Kontrolü:** Şef ürün grubu yönetimi tamamen admin kontrolüne geçti
-   **Merkezi Yönetim:** Tüm şeflerin ürün grupları admin panelinden kontrol edilir
-   **Güvenlik:** Şefler kendi ürün gruplarını değiştiremez
-   **Verimlilik:** Şefler sadece uzmanlık alanlarındaki ürünleri görür
-   **Hata Azaltma:** Yanlış ürün grubu ataması riski minimize edilir

### 10.4. Kullanım Senaryoları

#### Admin - Şef Ürün Grubu Yönetimi

```bash
# Tüm şefleri ve ürün gruplarını listele
GET /api/admin/chefs

# Şefin ürün grubunu bakery olarak ayarla
PUT /api/admin/chefs/{chefId}/product-group
{
  "productGroup": "BAKERY"
}

# Belirli bir şefin ürün grubunu öğren
GET /api/admin/chefs/{chefId}/product-group
```

#### Chef - Ürün Grubuna Göre Üretim Listesi

```bash
# Tatlı şefi için üretim listesi (sadece SWEETS grubundaki ürünler)
GET /api/chef/production-list-by-group?date=2024-09-04

# Bakery şefi için üretim listesi (sadece BAKERY grubundaki ürünler)
GET /api/chef/production-list-by-group?date=2024-09-04
```

### 10.5. Veri Modeli

#### User Model Güncellemesi

```json
{
    "id": "...",
    "email": "...",
    "name": "...",
    "surname": "...",
    "role": "CHEF",
    "productGroup": "SWEETS", // Yeni alan
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
}
```

#### Product Model Güncellemesi

```json
{
    "id": "...",
    "name": "Baklava",
    "description": "...",
    "productGroup": "SWEETS", // Ürünün ait olduğu grup
    "basePrice": 25.0,
    "isActive": true
}
```

### 10.6. Güvenlik ve Validasyon

-   **Yetki Kontrolü:** Admin endpoint'leri `authenticateToken` ve `requireAdmin` middleware'leri ile korunur
-   **Input Validasyonu:** `productGroup` değeri sadece "SWEETS" veya "BAKERY" olabilir
-   **Veri Bütünlüğü:** Şef bulunamazsa `USER_NOT_FOUND` hatası, geçersiz değerler için `INVALID_INPUT` hatası

### 10.7. Geriye Uyumluluk

-   Mevcut endpoint'ler (`/production-list`, `/orders`) değişmedi
-   Eski şefler için default değer `SWEETS` olarak ayarlandı
-   Hiçbir veri kaybı olmadı
-   Sistem geriye uyumlu olarak tasarlandığı için mevcut iş akışları etkilenmez

---

## 11. Distributor Price List Management & Client Assignment

### 11.1. Genel Bakış

Distributors can now create and manage their own price lists and assign clients to themselves. This functionality allows distributors to have full control over their pricing and client relationships.

### 11.2. Price List Management (Distributor)

All endpoints require `Authorization: Bearer <distributor_token>` or admin token.

#### 11.2.1. Get Distributor's Price Lists

- **Endpoint:** `GET /distributor/price-lists`
- **Auth:** Distributor or Admin JWT required
- **Description:** Get all price lists owned by the authenticated distributor
- **Response:**
```json
{
    "success": true,
    "message": "Distributor price lists fetched successfully",
    "data": [
        {
            "id": "pl_123",
            "name": "VIP Customers",
            "type": "RETAIL",
            "isDefault": true,
            "distributorId": "dist_456",
            "prices": [
                {
                    "id": "pli_789",
                    "price": 25.50,
                    "multiplier": null,
                    "optionItem": {
                        "id": "opt_123",
                        "name": "Premium Option",
                        "defaultPrice": 20.00
                    }
                }
            ]
        }
    ]
}
```

#### 11.2.2. Create Price List

- **Endpoint:** `POST /distributor/price-lists`
- **Auth:** Distributor or Admin JWT required
- **Body:**
```json
{
    "name": "Special Pricing",
    "type": "RETAIL",
    "isDefault": false
}
```
- **Response:**
```json
{
    "success": true,
    "message": "Price list created successfully",
    "data": {
        "id": "pl_123",
        "name": "Special Pricing",
        "type": "RETAIL",
        "isDefault": false,
        "distributorId": "dist_456"
    }
}
```

#### 11.2.3. Get Price List Details

- **Endpoint:** `GET /distributor/price-lists/:id`
- **Auth:** Distributor or Admin JWT required
- **Description:** Get detailed information about a specific price list (only if owned by distributor)
- **Response:** Same as admin price list details

#### 11.2.4. Update Price List Prices

- **Endpoint:** `PUT /distributor/price-lists/:id`
- **Auth:** Distributor or Admin JWT required
- **Body:**
```json
{
    "items": [
        {
            "optionItemId": "opt_123",
            "price": 30.00
        },
        {
            "optionItemId": "opt_456",
            "multiplier": 1.5
        }
    ]
}
```
- **Response:** Updated price list with new prices

#### 11.2.5. Delete Price List

- **Endpoint:** `DELETE /distributor/price-lists/:id`
- **Auth:** Distributor or Admin JWT required
- **Description:** Delete a price list (only if owned by distributor)
- **Response:**
```json
{
    "success": true,
    "message": "Price list deleted successfully. 3 user(s) reassigned to default price list.",
    "data": {
        "reassignedUsersCount": 3,
        "reassignedUsers": [
            {
                "id": "user_123",
                "email": "client@example.com",
                "name": "John",
                "surname": "Doe"
            }
        ],
        "defaultPriceListId": "pl_default"
    }
}
```

#### 11.2.6. Set Price List as Default

- **Endpoint:** `PUT /distributor/price-lists/:id/set-default`
- **Auth:** Distributor or Admin JWT required
- **Description:** Set a price list as default for the distributor
- **Response:** Updated price list with isDefault: true

#### 11.2.7. Get Admin-Assigned Price List

- **Endpoint:** `GET /distributor/price-lists/admin-price-list`
- **Auth:** Distributor JWT required
- **Description:** Get the admin-assigned price list for the distributor
- **Response:**
```json
{
    "success": true,
    "message": "Admin-assigned price list fetched successfully",
    "data": {
        "id": "pl_123",
        "name": "Admin Assigned Pricing",
        "type": "RETAIL",
        "isDefault": true,
        "prices": [
            {
                "id": "price_123",
                "optionItemId": "opt_123",
                "price": 25.00,
                "multiplier": null,
                "optionItem": {
                    "id": "opt_123",
                    "name": "Large Size",
                    "defaultPrice": 20.00,
                    "optionGroup": {
                        "product": {
                            "name": "Pizza Margherita"
                        }
                    }
                }
            }
        ]
    }
}
```

**Response when no admin-assigned price list:**
```json
{
    "success": true,
    "message": "No admin-assigned price list found",
    "data": null
}
```

### 11.3. Client Price List Management (Distributor)

#### 11.3.1. Get All Clients

- **Endpoint:** `GET /distributor/clients`
- **Auth:** Distributor or Admin JWT required
- **Description:** Get all clients for price list assignment
- **Query Parameters:**
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
- **Response:**
```json
{
    "success": true,
    "message": "Clients fetched successfully",
    "data": {
        "data": [
            {
                "id": "user_123",
                "email": "client@example.com",
                "name": "John",
                "surname": "Doe",
                "companyName": "ABC Corp",
                "phone": "+971500000001",
                "isActive": true,
                "priceList": {
                    "id": "pl_456",
                    "name": "VIP Pricing",
                    "type": "RETAIL",
                    "distributorId": "dist_789"
                },
                "assignedDistributor": {
                    "id": "dist_789",
                    "name": "Distributor",
                    "surname": "Name",
                    "email": "dist@example.com"
                }
            }
        ],
        "pagination": {
            "totalItems": 25,
            "totalPages": 3,
            "currentPage": 1,
            "pageSize": 10
        }
    }
}
```

#### 11.3.2. Assign Price List to Client

- **Endpoint:** `PUT /distributor/clients/:id/price-list`
- **Auth:** Distributor or Admin JWT required
- **Description:** Assign a price list to a client (or remove assignment by setting to null)
- **Body:**
```json
{
    "priceListId": "pl_123"
}
```
- **Response:**
```json
{
    "success": true,
    "message": "Client price list updated successfully",
    "data": {
        "id": "user_123",
        "email": "client@example.com",
        "priceListId": "pl_123"
    }
}
```
- **Note:** To remove price list assignment, send `"priceListId": null`

### 11.4. Security & Validation

- **Ownership Verification:** Distributors can only access/modify their own price lists
- **Role Validation:** All endpoints verify distributor or admin role
- **Data Isolation:** Each distributor's data is isolated from others

### 11.5. Error Handling

Common error responses:

```json
{
    "success": false,
    "message": "You can only access your own price lists",
    "status": 403
}
```

---

## 12. Genel Notlar

-   Tüm endpointlerde hata durumunda anlamlı hata mesajları JSON olarak döner.
-   JWT gerektiren endpointlerde, token olmadan veya hatalı token ile istek yapılırsa 401/403 döner.
-   Roller: ADMIN, CLIENT, CHEF, DRIVER, DISTRIBUTOR. İlgili endpointler role bazlı korunur.
-   Tüm tarih alanları ISO 8601 formatındadır.

---

## 13. Temel Akışlar için Örnekler

### Login → Ürünleri Listele → Sepete Ekle → Sipariş Oluştur

1. `POST /auth/login` ile token alın.

    ```json
    // Email ile login
    {
        "identifier": "client@gmail.com",
        "password": "client"
    }

    // Telefon ile login
    {
        "identifier": "+971500000002",
        "password": "client"
    }
    ```

2. `GET /products` ile ürün ve opsiyonları alın.
3. `POST /cart/items` ile ürün(ler)i sepete ekleyin.
4. `POST /orders` ile sepet içeriğine uygun sipariş verin.

### Favori Ürünler Akışı

1. `POST /auth/login` ile token alın.
    ```json
    {
        "identifier": "client@gmail.com",
        "password": "client"
    }
    ```
2. `GET /favorites` ile favorileri getirin.
3. `POST /favorites` ile {"productId": "..."} gönderip ürünü favorilere ekleyin.
4. `GET /favorites/check/:productId` ile favori durumunu kontrol edin.
5. `DELETE /favorites/:productId` ile favorilerden çıkarın.

### Chef – Üretim Yönetimi (Sadeleştirilmiş)

1. `GET /chef/production-list` ile günün üretim listesini alın (`PENDING` ve `PARTIALLY_COMPLETED` kalemler; kalan üretim toplamı).
2. `PUT /chef/order-items/:orderItemId/produce` ile `amount` ve `notes` gönderin (notes trim sonrası min 5 karakter).
3. **Otomatik:** Kalem tamamlandığında sistem otomatik olarak sipariş durumunu günceller:
    - Tüm kalemler tamamlandı → Sipariş `READY_FOR_DELIVERY` olur
    - Bazıları iptal edildi → Sipariş `PARTIALLY_COMPLETED` + `READY_FOR_DELIVERY` olur
4. Gerekirse `PUT /chef/order-items/:orderItemId/status` ile durumu `CANCELLED` olarak işaretleyin.

### Driver – Teslimat Yönetimi (Sadeleştirilmiş)

1. `GET /driver/orders` ile `READY_FOR_DELIVERY` durumundaki siparişleri alın (varsayılan davranış).
2. Kalem bazında kısmi teslimat için `PUT /driver/order-items/:orderItemId/deliver` ile `amount` ve `notes` gönderin.
3. Sipariş tamamlandığında `PUT /driver/orders/:orderId/status` ile:
    - `DELIVERED` (başarılı teslimat)
    - `FAILED` (başarısız teslimat - notes zorunlu)

### Yeni Durum Akışı Özeti

```
Sipariş Oluşturuldu
     ↓
[PENDING] → Chef Üretiyor → [COMPLETED/PARTIALLY_COMPLETED/CANCELLED]
     ↓                              ↓
[READY_FOR_DELIVERY] ← ───────────── Otomatik Geçiş
     ↓
Şoför Teslim Ediyor → [DELIVERED/FAILED]
```

---

## 14. Değişiklik Notları (v2.0 - Ağustos 2025)

### ✅ Sipariş Durum Sistemi Sadeleştirildi

**Kaldırılan Durumlar:**

-   ❌ `ProductionStatus.IN_PROGRESS` → Artık sadece `PENDING` veya `COMPLETED`
-   ❌ `ProductionStatus.PARTIAL` → Kısmi üretim artık otomatik yönetiliyor
-   ❌ `OrderDeliveryStatus.PENDING` → Artık `READY_FOR_DELIVERY`
-   ❌ `OrderDeliveryStatus.OUT_FOR_DELIVERY` → Ara durum kaldırıldı

**Yeni Özellikler:**

-   ✅ **Otomatik Durum Geçişi:** Şef bir kalemi tamamladığında sistem otomatik olarak sipariş durumunu günceller
-   ✅ **Temiz İş Akışı:** Sipariş oluşturuldu → Şef tamamladı → Şoförde → Teslim edildi
-   ✅ **Akıllı Teslimat Durumu:** `DELIVERED` durumu gönderildiğinde sistem otomatik olarak partial üretim kontrolü yapar ve uygun durumu (`DELIVERED` veya `PARTIALLY_DELIVERED`) belirler
-   ✅ **PARTIALLY_COMPLETED:** Bazı kalemler iptal edildiğinde net durum
-   ✅ **READY_FOR_DELIVERY:** Şoförün ne yapacağı net

**Geliştirici Notları:**

-   Frontend'te ara durumları (`IN_PROGRESS`, `OUT_FOR_DELIVERY`) kontrol eden kodları kaldırın
-   Driver listesi varsayılan olarak `READY_FOR_DELIVERY` durumundaki siparişleri getirir
-   Chef üretim listesi `PENDING` ve `PARTIALLY_COMPLETED` kalemlerini gösterir (kalan üretim toplamı)
-   Durum değişiklikleri artık otomatik - manuel ara durum güncellemesi gerekmez

### ✅ Telefon Numarası Desteği Eklendi (v2.1 - Ağustos 2025)

**Yeni Özellikler:**

-   ✅ **Çift Giriş Desteği:** Login artık email veya telefon numarası ile yapılabilir
-   ✅ **E.164 Format:** Telefon numaraları E.164 standardında saklanır (örn: `+971500000001`)
-   ✅ **Benzersizlik Kontrolü:** Email ve telefon numarası benzersiz olmalıdır
-   ✅ **Profil Güncelleme:** Kullanıcılar telefon numaralarını güncelleyebilir
-   ✅ **Admin Yönetimi:** Admin panelinden telefon numarası yönetimi

**API Değişiklikleri:**

-   **Login:** `identifier` alanı ile email veya telefon kabul eder
-   **Register:** `phone` alanı eklendi (opsiyonel)
-   **Profile:** `phone` alanı görüntüleme ve güncelleme
-   **Admin:** Kullanıcı listesi ve yönetiminde `phone` alanı

**Validasyon Kuralları:**

-   Telefon numarası E.164 formatında olmalıdır (`+[1-9][0-9]{1,14}`)
-   Email ve telefon benzersiz olmalıdır
-   Geçersiz format için 400, çakışma için 409 döner

**Test Kullanıcıları:**

-   Admin: `+971500000001` / `admin`
-   Client: `+971500000002` / `client`
-   Driver: `+971500000003` / `driver`
-   Chef: `+971500000004` / `chef`

### ✅ Şef Ürün Grubu Sistemi Eklendi (v2.2 - Eylül 2025)

**Yeni Özellikler:**

-   ✅ **Şef Uzmanlık Alanları:** Şefler artık sadece kendi uzmanlık alanlarındaki ürünleri görebilir
-   ✅ **Admin Kontrolü:** Şef ürün grubu yönetimi tamamen admin kontrolüne geçti
-   ✅ **Ürün Grupları:** SWEETS (tatlı) ve BAKERY (fırın) grupları
-   ✅ **Filtrelenmiş Üretim Listesi:** Şefler sadece kendi grubundaki ürünleri görür
-   ✅ **Merkezi Yönetim:** Admin panelinden şef ürün grupları yönetimi

**API Değişiklikleri:**

-   **Admin:** Yeni şef yönetim endpoint'leri (`/admin/chefs`, `/admin/chefs/:id/product-group`)
-   **Chef:** Yeni ürün grubu bazlı üretim listesi (`/chef/production-list-by-group`)
-   **User Model:** `productGroup` alanı eklendi (SWEETS/BAKERY)
-   **Product Model:** `productGroup` alanı eklendi
-   **Login Response:** JWT token ve user response'unda `productGroup` alanı eklendi
-   **Register Response:** Yeni kullanıcı kaydında `productGroup` alanı eklendi

**Güvenlik ve Validasyon:**

-   Şefler kendi ürün gruplarını değiştiremez
-   Admin yetkisi ile ürün grubu yönetimi
-   Geçersiz ürün grubu değerleri için validasyon
-   Geriye uyumluluk korundu

**Faydalar:**

-   **Verimlilik:** Şefler sadece uzmanlık alanlarındaki ürünleri görür
-   **Hata Azaltma:** Yanlış ürün grubu ataması riski minimize edilir
-   **Merkezi Kontrol:** Admin panelinden kolay yönetim
-   **Güvenlik:** Şefler kendi gruplarını değiştiremez

---

Bu dokümantasyon frontend ekibinin tüm temel akışları rahatça geliştirebilmesi için günceldir. Özel akış/örnek isterseniz ekleyebilirim.

---

## 15. Analytics (Admin)

-   Tüm endpointler `Authorization: Bearer <admin_token>` gerektirir.
-   Base path: `/admin/analytics`

### 13.1. Dashboard – Tüm veriler tek istekte

-   **Endpoint:** `GET /admin/analytics/dashboard`
-   **Amaç:** Ana dashboard için KPI kartları, grafik verileri ve uyarılar tek JSON içinde döner.
-   **Query Params (opsiyonel):**
    -   `deliveryBucket`: `delivered | partiallyDelivered | pending | readyForDelivery | failed | cancelled`
        -   Uygulandığında KPI ve tüm grafikler aynı kovaya göre filtrelenir.
        -   `orderStatusDistribution` içinde toplam dağılım `total` altında verilir ve seçili kova `filteredBucket` olarak döner.
-   **Başarılı Yanıt:**
    ```json
    {
        "kpis": {
            "todaysOrderCount": 23,
            "todaysTotalRevenue": 4520.5,
            "todaysCustomerCount": 12
        },
        "charts": {
            "last7DaysRevenue": [
                { "date": "2025-09-04", "revenue": 1200.25 },
                { "date": "2025-09-05", "revenue": 980.0 }
            ],
            "productionByGroupToday": [
                { "group": "SWEETS", "total": 120, "amount": 3250.0 },
                { "group": "BAKERY", "total": 80, "amount": 1270.5 }
            ],
            "revenueByGroupToday": [
                { "group": "SWEETS", "amount": 3250.0 },
                { "group": "BAKERY", "amount": 1270.5 }
            ],
            "orderStatusDistribution": {
                "DELIVERED": 15,
                "PARTIALLY_DELIVERED": 3,
                "FAILED": 2,
                "READY_FOR_DELIVERY": 5
            },
            "deliveryBucket": null
        },
        "alerts": {
            "delayedOrMissingCount": 4
        }
    }
    ```

### 13.2. Sipariş Raporu

-   **Endpoint:** `GET /admin/analytics/orders`
-   **Query Parameters:**
    -   `page` (optional, default: 1)
    -   `limit` (optional, default: 10)
    -   `startDate` (optional, ISO 8601)
    -   `endDate` (optional, ISO 8601)
    -   `status` (optional, `OrderDeliveryStatus`)
-   **Açıklama:** Filtrelere uyan siparişleri sayfalı döner. Her sipariş nesnesi, `calculateOrderPricing` ile hesaplanmış `initialTotalAmount` ve `finalTotalAmount` alanlarını içerir.
-   **Başarılı Yanıt:**
    ```json
    {
        "data": [
            {
                "id": "ord_123",
                "orderNumber": "ORD-202509-ABC123",
                "userId": "usr_1",
                "deliveryStatus": "DELIVERED",
                "productionStatus": "COMPLETED",
                "createdAt": "2025-09-04T08:00:00.000Z",
                "initialTotalAmount": 500.0,
                "finalTotalAmount": 480.0,
                "items": [
                    {
                        "productId": "prod_1",
                        "quantity": 2,
                        "unitPrice": 120.0,
                        "totalPrice": 240.0,
                        "selectedOptions": [
                            { "optionItem": { "id": "opt_1", "name": "..." } }
                        ],
                        "product": {
                            "id": "prod_1",
                            "name": "...",
                            "productGroup": "SWEETS"
                        }
                    }
                ],
                "user": { "id": "usr_1", "email": "...", "name": "..." }
            }
        ],
        "pagination": {
            "totalItems": 42,
            "totalPages": 5,
            "currentPage": 1,
            "pageSize": 10
        }
    }
    ```

### 13.3. Müşteri Raporu

-   **Endpoint:** `GET /admin/analytics/customers`
-   **Query Parameters:**
    -   `page` (optional, default: 1)
    -   `limit` (optional, default: 10)
    -   `sortBy` (optional, `totalSpending` | `orderCount`, default: `totalSpending`)
-   **Açıklama:** Müşterileri toplam harcama ve sipariş sayısına göre sıralı döner. Aşağıdaki hesaplanmış metrikleri içerir: `orderCount`, `totalSpending` (final), `totalInitial`, `aov` (Average Order Value), `savingsOrDiscount` (= `totalInitial - totalSpending`).
-   **Başarılı Yanıt:**
    ```json
    {
        "data": [
            {
                "userId": "usr_1",
                "orderCount": 12,
                "totalSpending": 3250.5,
                "totalInitial": 3400.0,
                "aov": 270.875,
                "savingsOrDiscount": 149.5,
                "user": {
                    "id": "usr_1",
                    "email": "...",
                    "name": "...",
                    "surname": "..."
                }
            }
        ],
        "pagination": {
            "totalItems": 120,
            "totalPages": 12,
            "currentPage": 1,
            "pageSize": 10
        }
    }
    ```

### 13.4. Üretim Raporu

-   **Endpoint:** `GET /admin/analytics/production`
-   **Query Parameters:**
    -   `startDate` (optional, ISO 8601)
    -   `endDate` (optional, ISO 8601)
    -   `productGroup` (optional, `SWEETS` | `BAKERY`)
-   **Açıklama:** Tarih aralığında ürün ve ürün grubu bazında toplam sipariş adedi (`ordered`), üretilen adet (`produced`), iptal edilen adet (`cancelled`) döner.
-   **Başarılı Yanıt:**
    ```json
    {
        "byGroup": [
            {
                "group": "SWEETS",
                "ordered": 200,
                "produced": 180,
                "cancelled": 10
            },
            {
                "group": "BAKERY",
                "ordered": 150,
                "produced": 140,
                "cancelled": 5
            }
        ],
        "byProduct": [
            {
                "productId": "prod_1",
                "productName": "Baklava",
                "group": "SWEETS",
                "ordered": 120,
                "produced": 110,
                "cancelled": 5
            },
            {
                "productId": "prod_2",
                "productName": "Simit",
                "group": "BAKERY",
                "ordered": 80,
                "produced": 75,
                "cancelled": 3
            }
        ]
    }
    ```

### 13.5. Finans Raporu

-   **Endpoint:** `GET /admin/analytics/financials`
-   **Query Parameters:**
    -   `timeframe` (required): `daily` | `weekly` | `monthly`
-   **Açıklama:** Zaman dilimine göre `initialTotalAmount` ve `finalTotalAmount` toplamları ile trend serisini döner. `delta = initialTotalAmount - finalTotalAmount` (indirim/kayıp).
-   **Başarılı Yanıt:**
    ```json
    {
        "totals": {
            "initialTotalAmount": 12000.0,
            "finalTotalAmount": 11500.0,
            "delta": 500.0
        },
        "trend": [
            {
                "period": "2025-09-01",
                "initialTotalAmount": 2000.0,
                "finalTotalAmount": 1900.0,
                "delta": 100.0
            },
            {
                "period": "2025-09-02",
                "initialTotalAmount": 2200.0,
                "finalTotalAmount": 2150.0,
                "delta": 50.0
            }
        ]
    }
    ```

````

---

## 16. Admin Sipariş İptal Özelliği - Frontend Kullanım Rehberi

### 14.1. Genel Bakış

Admin panelinde sipariş iptal etme özelliği eklendi. Bu özellik sadece `PENDING` ve `READY_FOR_DELIVERY` durumundaki siparişleri iptal edebilir.

### 14.2. API Endpoint

**Endpoint:** `PUT /admin/orders/:orderId/cancel`
**Yetki:** Admin token gerekli
**Content-Type:** `application/json`

### 14.3. Frontend Entegrasyonu

#### 14.3.1. Sipariş İptal Butonu

Sipariş listesinde veya detay sayfasında, sadece iptal edilebilir durumda olan siparişler için "İptal Et" butonu gösterin:

```javascript
// Siparişin iptal edilebilir olup olmadığını kontrol et
const canCancelOrder = (order) => {
return ['PENDING', 'READY_FOR_DELIVERY'].includes(order.deliveryStatus);
};

// React/Vue/Angular component örneği
const OrderListItem = ({ order }) => {
return (
  <div className="order-item">
    <span>Sipariş: {order.orderNumber}</span>
    <span>Durum: {order.deliveryStatus}</span>

    {canCancelOrder(order) && (
      <button
        onClick={() => handleCancelOrder(order.id)}
        className="btn-cancel-order"
        style={{ backgroundColor: '#dc3545', color: 'white' }}
      >
        İptal Et
      </button>
    )}
  </div>
);
};
````

#### 14.3.2. İptal Modal/Form

İptal butonu tıklandığında, iptal nedeni girişi için modal açın:

```javascript
const CancelOrderModal = ({ orderId, onClose, onConfirm }) => {
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasyon
        if (notes.trim().length < 5) {
            alert("İptal nedeni en az 5 karakter olmalıdır.");
            return;
        }

        setLoading(true);
        try {
            await onConfirm(orderId, notes.trim());
            onClose();
        } catch (error) {
            alert("Sipariş iptal edilirken hata oluştu: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Siparişi İptal Et</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>İptal Nedeni *</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Örn: Müşteri isteği üzerine iptal edildi"
                            required
                            minLength={5}
                            rows={4}
                            className="form-control"
                        />
                        <small>Minimum 5 karakter gereklidir.</small>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}>
                            Vazgeç
                        </button>
                        <button
                            type="submit"
                            disabled={loading || notes.trim().length < 5}
                            className="btn-danger">
                            {loading
                                ? "İptal Ediliyor..."
                                : "Siparişi İptal Et"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
```

#### 14.3.3. API İsteği

```javascript
// API servis fonksiyonu
const cancelOrder = async (orderId, notes) => {
    const token = localStorage.getItem("adminToken"); // veya context/store'dan

    const response = await fetch(`/api/admin/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Sipariş iptal edilemedi");
    }

    return data.data; // İptal edilen sipariş bilgileri
};

// Component'te kullanım
const handleCancelOrder = async (orderId, notes) => {
    try {
        const cancelledOrder = await cancelOrder(orderId, notes);

        // Başarılı iptal sonrası işlemler:
        // 1. Sipariş listesini güncelle
        updateOrderInList(cancelledOrder);

        // 2. Başarı mesajı göster
        showSuccessMessage(
            `Sipariş ${cancelledOrder.orderNumber} başarıyla iptal edildi.`
        );

        // 3. Dashboard istatistiklerini güncelle (gerekirse)
        refreshDashboardStats();
    } catch (error) {
        showErrorMessage(error.message);
    }
};
```

#### 14.3.4. Durum Güncellemesi

İptal sonrası UI güncellemeleri:

```javascript
// Sipariş listesindeki öğeyi güncelle
const updateOrderInList = (cancelledOrder) => {
    setOrders((prevOrders) =>
        prevOrders.map((order) =>
            order.id === cancelledOrder.id
                ? {
                      ...order,
                      deliveryStatus: "CANCELLED",
                      productionStatus: "CANCELLED",
                      finalTotalAmount: 0,
                  }
                : order
        )
    );
};

// Durum badge'i güncellemesi
const getStatusBadge = (status) => {
    const statusConfig = {
        PENDING: { label: "Bekliyor", color: "#ffc107" },
        READY_FOR_DELIVERY: { label: "Teslimata Hazır", color: "#17a2b8" },
        DELIVERED: { label: "Teslim Edildi", color: "#28a745" },
        CANCELLED: { label: "İptal Edildi", color: "#dc3545" },
        FAILED: { label: "Başarısız", color: "#dc3545" },
    };

    const config = statusConfig[status] || { label: status, color: "#6c757d" };

    return (
        <span
            className="status-badge"
            style={{ backgroundColor: config.color, color: "white" }}>
            {config.label}
        </span>
    );
};
```

### 14.4. UX/UI Önerileri

#### 14.4.1. Görsel Tasarım

-   İptal butonu kırmızı renkte olsun (#dc3545)
-   İptal edilen siparişler listede soluk/gri tonlarda gösterilsin
-   İptal durumu açıkça belirtilsin

#### 14.4.2. Kullanıcı Deneyimi

-   İptal işlemi geri alınamaz olduğu için onay modal'ı kullanın
-   İptal nedeni zorunlu olsun ve anlamlı örnekler verin
-   Loading state'leri gösterin
-   Başarı/hata mesajları net olsun

#### 14.4.3. Hata Yönetimi

```javascript
// Hata durumları ve mesajları
const handleCancelError = (error) => {
    let userMessage = "Sipariş iptal edilirken bir hata oluştu.";

    if (error.message.includes("DELIVERED")) {
        userMessage = "Teslim edilmiş siparişler iptal edilemez.";
    } else if (error.message.includes("CANCELLED")) {
        userMessage = "Bu sipariş zaten iptal edilmiş.";
    } else if (error.message.includes("notes")) {
        userMessage = "İptal nedeni en az 5 karakter olmalıdır.";
    }

    showErrorMessage(userMessage);
};
```

### 14.5. Test Senaryoları

Frontend ekibi aşağıdaki senaryoları test etmelidir:

1. **Başarılı İptal:**

    - PENDING durumundaki sipariş iptal edilebilir
    - READY_FOR_DELIVERY durumundaki sipariş iptal edilebilir
    - İptal sonrası durum CANCELLED olarak güncellenir

2. **Hata Senaryoları:**

    - DELIVERED siparişi iptal etmeye çalışma
    - CANCELLED siparişi tekrar iptal etmeye çalışma
    - 5 karakterden kısa iptal nedeni girme
    - Ağ hatası durumunda error handling

3. **UI/UX Testleri:**
    - İptal butonu sadece uygun durumlarda görünür
    - Modal açılır/kapanır doğru çalışır
    - Loading state'leri doğru gösterilir
    - Başarı/hata mesajları uygun şekilde gösterilir

### 14.6. Güvenlik Notları

-   Admin token'ı güvenli şekilde saklayın
-   API isteklerinde CSRF koruması kullanın
-   İptal nedeni XSS saldırılarına karşı sanitize edin
-   Rate limiting uygulayın (çok fazla iptal isteği engellenmeli)

## 15. User Management API

### 15.1. Update User Information

**Endpoint:** `PUT /api/users/:id`

**Description:** Admin tarafından kullanıcı bilgilerini güncelleme (priceListId desteği dahil)

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
    "email": "yeni@email.com",
    "phone": "+971500000002",
    "name": "Yeni İsim",
    "surname": "Yeni Soyisim",
    "role": "CLIENT",
    "isActive": true,
    "address": "Yeni Adres",
    "companyName": "Yeni Şirket",
    "productGroup": "BAKERY",
    "priceListId": "pl_123"
}
```

**Field Descriptions:**
- `email` (string, optional): Kullanıcının yeni email adresi
- `phone` (string, optional): Kullanıcının yeni telefon numarası (+971500000001 formatında)
- `name` (string, optional): Kullanıcının yeni adı
- `surname` (string, optional): Kullanıcının yeni soyadı
- `role` (string, optional): Kullanıcının rolü (CLIENT, DISTRIBUTOR, CHEF, DRIVER, ADMIN)
- `isActive` (boolean, optional): Kullanıcının aktif durumu
- `address` (string, optional): Kullanıcının adresi
- `companyName` (string, optional): Şirket adı
- `productGroup` (string, optional): Ürün grubu (SWEETS, BAKERY) - sadece CHEF'ler için
- `priceListId` (string, optional): Kullanıcıya atanan fiyat listesi ID'si

**Success Response (200):**
```json
{
    "success": true,
    "message": "User updated successfully",
    "data": {
        "id": "user_123",
        "email": "yeni@email.com",
        "name": "Yeni İsim",
        "surname": "Yeni Soyisim",
        "phone": "+971500000002",
        "role": "CLIENT",
        "isActive": true,
        "address": "Yeni Adres",
        "companyName": "Yeni Şirket",
        "productGroup": "BAKERY",
        "priceListId": "pl_123",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T12:00:00.000Z"
    }
}
```

**Error Responses:**

**400 Bad Request - Invalid Phone Format:**
```json
{
    "success": false,
    "message": "Invalid phone number format. It should be (e.g. +971500000001) format.",
    "error": "INVALID_PHONE_FORMAT"
}
```

**404 Not Found - Price List Not Found:**
```json
{
    "success": false,
    "message": "Price list not found",
    "error": "NOT_FOUND"
}
```

**409 Conflict - Email Already Exists:**
```json
{
    "success": false,
    "message": "User with this email already exists",
    "error": "AUTH_USER_ALREADY_EXISTS"
}
```

**409 Conflict - Phone Already Exists:**
```json
{
    "success": false,
    "message": "This phone number is already registered.",
    "error": "CONFLICT"
}
```

**403 Forbidden - Unauthorized:**
```json
{
    "success": false,
    "message": "Unauthorized access. Admin access required.",
    "error": "FORBIDDEN"
}
```

### 15.2. Validation Rules

1. **Email Validation:**
   - Email format kontrolü
   - Benzersizlik kontrolü (aynı email başka kullanıcıda olmamalı)

2. **Phone Validation:**
   - Format: +971500000001 (UAE format)
   - Benzersizlik kontrolü (aynı telefon başka kullanıcıda olmamalı)

3. **PriceListId Validation:**
   - Eğer gönderilirse, veritabanında mevcut olmalı
   - Silinmemiş (deletedAt: null) olmalı

4. **Role Validation:**
   - Geçerli rol değerleri: CLIENT, DISTRIBUTOR, CHEF, DRIVER, ADMIN

5. **ProductGroup Validation:**
   - Geçerli değerler: SWEETS, BAKERY
   - Sadece CHEF rolündeki kullanıcılar için geçerli

### 15.3. Frontend Integration Example

```javascript
const updateUser = async (userId, userData) => {
    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('User update failed:', error);
        throw error;
    }
};

// Usage example
const userData = {
    name: "John",
    surname: "Doe",
    email: "john.doe@example.com",
    phone: "+971500000001",
    role: "DISTRIBUTOR",
    isActive: true,
    companyName: "ABC Company",
    priceListId: "pl_wholesale_001"
};

const updatedUser = await updateUser("user_123", userData);
```

### 15.4. Test Scenarios

1. **Successful Update:**
   - Tüm alanları başarıyla güncelleme
   - Sadece belirli alanları güncelleme
   - priceListId atama ve kaldırma

2. **Validation Errors:**
   - Geçersiz email formatı
   - Geçersiz telefon formatı
   - Mevcut olmayan priceListId
   - Duplicate email/phone

3. **Authorization:**
   - Admin olmayan kullanıcının erişim denemesi
   - Geçersiz token ile erişim denemesi

4. **Edge Cases:**
   - Boş string değerler
   - null değerler
   - Undefined değerler
