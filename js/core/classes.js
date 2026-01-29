// js/core/classes.js

function User(username, pass, ho, ten, email, products, donhang) {
	this.ho = ho || '';
	this.ten = ten || '';
	this.email = email || '';

	this.username = username;
	this.pass = pass;
	this.products = products || [];
	this.donhang = donhang || [];
    this.off = false; // Trạng thái khóa tài khoản
}

function equalUser(u1, u2) {
	return (u1.username == u2.username && u1.pass == u2.pass);
}

function Promo(name, value) { // khuyen mai
	this.name = name; // giamGia, traGop, giaReOnline, moiramat
	this.value = value;

	this.toWeb = function () {
		if (!this.name) return "";
		var contentLabel = "";
		switch (this.name) {
			case "giamgia":
				contentLabel = `<i class="fa fa-bolt"></i> Giảm ` + this.value + `&#8363;`;
				break;
			case "tragop":
				contentLabel = `Trả góp ` + this.value + `%`;
				break;
			case "giareonline":
				contentLabel = `Giá rẻ online`;
				break;
			case "moiramat":
				contentLabel = "Mới ra mắt";
				break;
		}
		return `<label class="${this.name}">${contentLabel}</label>`;
	}
}

function Product(masp, name, img, price, star, rateCount, promo, detail, inventory) {
	this.masp = masp;
	this.img = img;
	this.name = name;
	this.price = price;
	this.star = star;
	this.rateCount = rateCount;
	this.promo = promo;
    this.detail = detail || {};
    this.inventory = inventory || 0;
}