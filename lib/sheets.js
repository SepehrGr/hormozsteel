import { google } from 'googleapis';

export async function getProducts() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
        project_id: process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID,
        private_key_id: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
          /\\n/g,
          '\n'
        ),
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_ID,
        auth_uri: process.env.GOOGLE_SERVICE_ACCOUNT_AUTH_URI,
        token_uri: process.env.GOOGLE_SERVICE_ACCOUNT_TOKEN_URI,
        auth_provider_x509_cert_url:
          process.env.GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url:
          process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
        universe_domain: process.env.GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({
      auth,
      version: 'v4',
    });

    // ابتدا لیست شیت‌های موجود را بگیریم
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
    });

    const availableSheets = spreadsheetInfo.data.sheets.map(
      (sheet) => sheet.properties.title
    );

    console.log('Available sheets:', availableSheets);

    let allProducts = [];

    // تلاش برای خواندن از هر شیت موجود
    for (const sheetName of availableSheets) {
      try {
        console.log(`Reading from sheet: ${sheetName}`);

        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.SPREADSHEET_ID,
          range: `${sheetName}!A2:Z`, // از ردیف دوم شروع کن که سرستون‌ها خوانده نشود
        });

        const rows = response.data.values;

        if (rows && rows.length) {
          const sheetProducts = rows
            .filter((row) => row && row.length > 0 && row[1]) // فقط ردیف‌هایی که نام محصول دارند
            .map((row, index) => ({
              id: row[0] || `${sheetName}-${index + 1}`,
              name: row[1] || '',
              size: row[2] || '',
              price: row[3] || '',
              inStock:
                row[4] === 'true' ||
                row[4] === 'TRUE' ||
                row[4] === true ||
                row[4] === '1' ||
                row[4] === 'موجود',
              unit: row[5] || '',
              description: row[6] || '',
              brand: row[7] || '',
              subcategory: row[8] || '',
              sheetSource: sheetName, // نام شیت را به عنوان منبع اضافه کن
            }));

          allProducts = allProducts.concat(sheetProducts);
          console.log(
            `Found ${sheetProducts.length} products in sheet: ${sheetName}`
          );
        } else {
          console.log(`No data found in sheet: ${sheetName}`);
        }
      } catch (sheetError) {
        // اگر خطایی در خواندن شیت خاص بود، به شیت بعدی برو
        console.log(`Could not read sheet ${sheetName}:`, sheetError.message);
        continue;
      }
    }

    console.log(
      `Total products found across all sheets: ${allProducts.length}`
    );
    return allProducts;
  } catch (err) {
    console.error('Error fetching sheet data:', err);
    return [];
  }
}

// تابع جدید برای گرفتن محصولات از شیت خاص
export async function getProductsFromSheet(sheetName) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
        project_id: process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID,
        private_key_id: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
          /\\n/g,
          '\n'
        ),
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_ID,
        auth_uri: process.env.GOOGLE_SERVICE_ACCOUNT_AUTH_URI,
        token_uri: process.env.GOOGLE_SERVICE_ACCOUNT_TOKEN_URI,
        auth_provider_x509_cert_url:
          process.env.GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url:
          process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
        universe_domain: process.env.GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({
      auth,
      version: 'v4',
    });

    console.log(`Reading from specific sheet: ${sheetName}`);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: `${sheetName}!A2:Z`,
    });

    const rows = response.data.values;

    if (rows && rows.length) {
      return rows
        .filter((row) => row && row.length > 0 && row[1])
        .map((row, index) => ({
          id: row[0] || `${sheetName}-${index + 1}`,
          name: row[1] || '',
          size: row[2] || '',
          price: row[3] || '',
          inStock:
            row[4] === 'true' ||
            row[4] === 'TRUE' ||
            row[4] === true ||
            row[4] === '1' ||
            row[4] === 'موجود',
          unit: row[5] || '',
          description: row[6] || '',
          brand: row[7] || '',
          subcategory: row[8] || '',
          sheetSource: sheetName,
        }));
    }

    return [];
  } catch (err) {
    console.error(`Error fetching data from sheet ${sheetName}:`, err);
    return [];
  }
}

// تابع برای گرفتن لیست شیت‌های موجود
export async function getAvailableSheets() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
        project_id: process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID,
        private_key_id: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
          /\\n/g,
          '\n'
        ),
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_ID,
        auth_uri: process.env.GOOGLE_SERVICE_ACCOUNT_AUTH_URI,
        token_uri: process.env.GOOGLE_SERVICE_ACCOUNT_TOKEN_URI,
        auth_provider_x509_cert_url:
          process.env.GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url:
          process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
        universe_domain: process.env.GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({
      auth,
      version: 'v4',
    });

    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
    });

    return spreadsheetInfo.data.sheets.map((sheet) => ({
      title: sheet.properties.title,
      sheetId: sheet.properties.sheetId,
      index: sheet.properties.index,
      rowCount: sheet.properties.gridProperties?.rowCount || 0,
      columnCount: sheet.properties.gridProperties?.columnCount || 0,
    }));
  } catch (err) {
    console.error('Error fetching sheets info:', err);
    return [];
  }
}
