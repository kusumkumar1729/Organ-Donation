const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "development",
  entry: "./src/main.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist"),
  },
  
  plugins: [

    new CopyWebpackPlugin({
      patterns: [
        // HTML files (removed homepage.html since it's handled by HtmlWebpackPlugin)
        { from: "./src/index.html", to: "index.html" },
        { from: "./src/homepage.html", to: "homepage.html" },
        { from: "./src/html/about-us.html", to: "about-us.html" },
        { from: "./src/html/contact.html", to: "contact.html" },
        { from: "./src/html/awareness.html", to: "awareness.html" },
        { from: "./src/html/donor-registration.html", to: "donor-registration.html" },
        { from: "./src/html/donor-pledge.html", to: "donor-pledge.html" },
        { from: "./src/html/patient-registration.html", to: "patient-registration.html" },
        { from: "./src/html/verify-pledges.html", to: "verify-pledges.html" },
        { from: "./src/html/view-donors.html", to: "view-donors.html" },
        { from: "./src/html/view-pledges.html", to: "view-pledges.html" },
        { from: "./src/html/view-patients.html", to: "view-patients.html" },
        { from: "./src/html/transplant-matching.html", to: "transplant-matching.html" },
        { from: "./src/html/success.html", to: "success.html" },
        // Authentication HTML files
        { from: "./src/login-admin.html", to: "login-admin.html" },
        { from: "./src/register-admin.html", to: "register-admin.html" },
        { from: "./src/otp.html", to: "otp.html" },
        { from: "./src/login-user.html", to: "login-user.html" },
        { from: "./src/register-user.html", to: "register-user.html" },
        // CSS files
        { from: "./src/css/bootstrap.css", to: "css/bootstrap.css" },
        { from: "./src/css/styles.css", to: "css/styles.css" },
        { from: "./src/css/style-home.css", to: "css/style-home.css" },
        { from: "./src/css/fontawesome-all.css", to: "css/fontawesome-all.css" },
        { from: "./src/css/login.css", to: "css/login.css" },
        { from: "./src/css/register.css", to: "css/register.css" },
        { from: "./src/css/contact.css", to: "css/contact.css" },
        // Images
        { from: "./src/images/organ-donation-logo.svg", to: "images/organ-donation-logo.svg" },
        { from: "./src/images/organ-donation-logo-new.svg", to: "images/organ-donation-logo-new.svg" },
        { from: "./src/images/logo-new-final.svg", to: "images/logo-new-final.svg" },
        { from: "./src/images/logo-final-1.svg", to: "images/logo-final-1.svg" },
        { from: "./src/images/logo-final-2.svg", to: "images/logo-final-2.svg" },
        { from: "./src/images/header-image-new.png", to: "images/header-image-new.png" },
        { from: "./src/images/organ-donation-platform-logo.svg", to: "images/organ-donation-platform-logo.svg" },
        { from: "./src/images/organ-donation-platform-logo-1.svg", to: "images/organ-donation-platform-logo-1.svg" },
        { from: "./src/images/organ-donation-platform-logo-white.svg", to: "images/organ-donation-platform-logo-white.svg" },
        { from: "./src/images/donation-icon.svg", to: "images/donation-icon.svg" },
        { from: "./src/images/transplant-icon.svg", to: "images/transplant-icon.svg" },
        { from: "./src/images/waiting-list-icon.svg", to: "images/waiting-list-icon.svg" },
        { from: "./src/images/image3.jpeg", to: "images/image3.jpeg" },
        { from: "./src/images/image2.jpg", to: "images/image2.jpg" },
        { from: "./src/images/mail-icon.svg", to: "images/mail-icon.svg" },
        { from: "./src/images/mail-icon.svg", to: "images/mail-icon.svg" },
       
      ],
    }),
  ],
  
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 9000, // Specify a port for the dev server
  },
};