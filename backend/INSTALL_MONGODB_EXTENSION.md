# 🔧 Install PHP MongoDB Extension (Windows)

## ⚠️ Issue: MongoDB Extension Not Installed

Your backend is getting 500 errors because the **PHP MongoDB extension** is not installed.

## 📥 Installation Steps

### Step 1: Check Your PHP Version
```bash
php -v
```

Note your PHP version (e.g., PHP 8.1, 8.2, 8.3)

### Step 2: Download MongoDB Extension

1. Go to: https://pecl.php.net/package/mongodb
2. Click on "DLL" link next to the latest version
3. OR go directly to: https://windows.php.net/downloads/pecl/releases/mongodb/

4. Download the file that matches your PHP version:
   - For **PHP 8.1**: `php_mongodb-1.20.1-8.1-ts-x64.zip`
   - For **PHP 8.2**: `php_mongodb-1.20.1-8.2-ts-x64.zip`
   - For **PHP 8.3**: `php_mongodb-1.20.1-8.3-ts-x64.zip`

   Choose:
   - **x64** (64-bit) - most common
   - **ts** (Thread Safe) - if using Apache/IIS
   - **nts** (Non Thread Safe) - if using PHP CLI only

### Step 3: Install the Extension

1. **Extract** the downloaded ZIP file
2. **Find** the `php_mongodb.dll` file
3. **Copy** `php_mongodb.dll` to your PHP extensions directory:
   - Usually: `C:\php\ext\` or `C:\xampp\php\ext\`
   - To find it, run: `php --ini` and look for "extension_dir"

### Step 4: Enable the Extension

1. **Find** your `php.ini` file:
   ```bash
   php --ini
   ```
   
2. **Open** `php.ini` in a text editor (as Administrator)

3. **Add** this line (usually in the extensions section):
   ```ini
   extension=mongodb
   ```

4. **Save** the file

### Step 5: Verify Installation

Restart your terminal and run:
```bash
php -m | findstr mongodb
```

You should see: `mongodb`

Or run:
```bash
php -r "echo extension_loaded('mongodb') ? 'MongoDB extension is installed' : 'MongoDB extension NOT installed';"
```

Should output: `MongoDB extension is installed`

### Step 6: Restart Laravel Server

1. Stop the current server (Ctrl+C)
2. Start it again:
   ```bash
   php artisan serve
   ```

3. Test in browser: `http://localhost:8000/api/health`

---

## 🚀 Alternative: Use XAMPP/WAMP

If you're using XAMPP or WAMP, the MongoDB extension might be easier to install:

### XAMPP:
1. Open XAMPP Control Panel
2. Click "Config" next to Apache
3. Select `php.ini`
4. Add: `extension=mongodb`
5. Restart Apache

---

## 📝 Quick Reference

**Find PHP extensions directory:**
```bash
php -i | findstr extension_dir
```

**Find php.ini location:**
```bash
php --ini
```

**Check if MongoDB is loaded:**
```bash
php -m
```

---

## ❓ Need Help?

If you're having trouble:
1. Make sure you downloaded the correct version for your PHP
2. Make sure the DLL is in the correct `ext` directory
3. Make sure you edited the correct `php.ini` file
4. Restart your terminal after making changes

---

**After installing, your API will work perfectly!** 🎉
