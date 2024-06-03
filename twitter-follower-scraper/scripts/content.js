chrome.runtime.onMessage.addListener((data, sender, sendResponse) => {
	if (data.msg === 'do-scraping') {
		DoScrape();
	}
});

async function DoScrape(){
	//create a notifer element
	let notifer_el = document.createElement("div");
	notifer_el.style.zIndex = 999;
	notifer_el.style.backgroundColor = "#005993";
	notifer_el.style.color = "#ffffff";
	notifer_el.style.position = "fixed";
	notifer_el.style.left = "12px";
	notifer_el.style.top = "12px";
	notifer_el.style.width = "340px";
	notifer_el.style.fontSize = "14px";
	notifer_el.style.padding = "6px 10px 6px 10px";
	notifer_el.style.border = "5px solid rgb(255, 208, 0)";
	notifer_el.style.borderRadius = "7px";
	notifer_el.innerHTML = "Twitter Target Page Follower Scraper (by v-User) </ br> Scraping process started...";
	console.log("Scraping process started...");
	document.body.insertBefore(notifer_el, document.body.firstChild);

	var all_members_info = "";
	let dowhile = true;
	//برای چک کردن وجود تب فالوور-----------------
	//تب فالوور و هر فالوور رو که data-get نداشت رو میگیریم-----------------
	let memberRows = document.querySelector("div[aria-label='Timeline: Followers'] [role=button] a[role=link]:not([data-get])");
	if (memberRows) {
		// یک متغیر برای گرفتن لینک صفحه فالوورها و یک متغیر برای لیست سیاه(لیست سیاه برای جلوگیری گرفتن اطلاعات کاربر تکراری) و یک متغیر برای شمارش تعداد فالوور های استخراج شده
		let el_href = "", black_list = "",uniqueCounter = 0;
		try {
			// تا وقتی true باشه این عمل انجام میشه -----------------
			while (dowhile) {
				memberRows = document.querySelector("div[aria-label='Timeline: Followers'] [role=button] a[role=link]:not([data-get])");
				if (memberRows){
					// اگر فالوور data-get نداشت وجود داشت بیاد اسکرول کنه برای نمایش -----------------
					memberRows.scrollIntoView();

					//300 میلی ثانیه زمان میبره تا فالوورها لود بشه -----------------
					await wait(300);

					// به انتهای لیست میرسه و اسکرول میکنه -----------------
					window.scrollTo(0, document.body.scrollHeight);
					// اتریبیوت href تگ مورد نظر هر کاربر رو میگیریم -----------------
					el_href = memberRows.getAttribute("href");
					// اگر href تکراری نداشتیم یعنی داخل بلک لیست ما نبود دستور های زیر اجرا میشه -----------------
					if (!black_list.includes(el_href)){
						// متغیر بعدی رو شمارش میکنه -----------------
						uniqueCounter+=1;
						// اگر داخل لینکی که گرفتیم اسلش بود اون رو برمیداریم و بعنوان نام کاربری ذخیره میکنیم -----------------
						const username = el_href.replaceAll("/","");
						//باتوجه به لینک هر صفحه در توییتر اینجا با استفاده از hrefی که گرفتیم لینک صفحه ی هر فالوور رو میسازیم -----------------
						const profile_link = `https://www.twitter.com${el_href}`

						// نام کاربری و لینک صفحه کاربر رو توی یک خط مینویسه -----------------
						const current_member_info = `Username: ${username}, Profile Link: ${profile_link}`;
						all_members_info += current_member_info + "\r\n";

						// بعد از گرفتن اطلاعات هر کاربر اون رو داخل بلک لیست میذاره تا دوباره تکرار نشه -----------------
						black_list = black_list + el_href;

						//اگر تعداد اعضا بیشتر از 499 بشه دیگه استخراج نمیکنه -----------------
						if (uniqueCounter > 499){
							throw new Error('break');
						}

					}
					// بعد از گرفتن هر کاربر به اون کاربر اتریبیوت data-get = 1 میدیم تا بره کاربر بعدی و از لیست کاربر هایی که data-get ندارن خارج شه و روند بالا تکرار شه -----------------
					memberRows.setAttribute("data-get","1");
				}else{
					// طبق حلقه ای که نوشتیم قرار بود وقتی dowhile برای با true بود دستورهای بالا انجام بشن-----------------
					// وقتی عمل استخراج انجام شد و data-get اضافه شد لازمه دوباره چک بشه که ایا فالوور بعدی وجود داره یا نه پس false میذاریم که از شرط بیاد بیرون و حلقه تکرار شه-----------------
					dowhile = false;
				}
			}
		} catch (e) {
			if (e.message !== 'break') throw e;
		}


		const member_amount_info = `Found ${uniqueCounter} users`;
		console.log(member_amount_info);
		notifer_el.innerHTML = `Twitter Target Page Follower Scraper (by v-User) </ br> Scraping process finished and found ${uniqueCounter} unique user.`;
		console.log("Scraping process finished.");

		// اینحا ایدی پیج هدفی که فالوور هاشو گرفتیم رو ذخیره میکنیم -----------------
		let targetPage = document.querySelector("div[data-testid=primaryColumn] h2 + div span");
		//گرفتن آی دی شخص مورد نظر و ذخیره ی فایل به اسم همان شخص -----------------
		let fn = targetPage.textContent + " followers scraped by vUser";
		//حذف علائم زیر از نام فایل تا بصورت استاندار و بدون مشکل نام فایل ذخیره بشه -----------------
		fn = fn.replace(/[\/\\@?%*:|"<>.]/g, '');
		all_members_info=all_members_info.replace("#","-")
		//ذخیره ی فایل txt
		const uri = "data:text/plain;charset=utf-8," + all_members_info;
		let ea = document.createElement("a");
		ea.href = uri;
		ea.download = fn; //group name
		document.body.appendChild(ea);
		ea.click();
		// 	document.body.removeChild(ea);

	} else {
		//اگر تب فالوور قابل مشاهده نبود و پیدا نشد ارور میده -----------------
		notifer_el.style.backgroundColor = "#005993";
		notifer_el.innerHTML = "Twitter Target Page Follower Scraper (by v-User) </ br> Error: Members list is not visible!";
		console.log("Error: Members list is not visible!");
	}
}

// ساخت فانکشن برای ایجاد مکث -----------------
function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
