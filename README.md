<img width="100" height="100" alt="image" src="https://github.com/user-attachments/assets/38655d90-de16-46c8-b585-cc820ffea65e" />

# Propel Webpage

A full-stack web application designed to power my tutoring business.

## Overview

This site is the foundation of a scalable tutoring platform, built to grow alongside the business. The focus is on automation, clarity, and simplicity. Here’s what you'll find:

### **Public Website** *(In Progress)*

A client-facing website that introduces the tutoring service and makes it easy for new clients to get started.

Pages and features:
* **Home**: general information about the company featuring a canvas that draws the company logo from a polar equation
* **About Us**: highlights each tutor’s background and strengths, as well as the team as a whole
* **FAQ and Contact Information**: frequently asked questions and contact information for prospective clients' easy access
* **Client Intake Form**: information gathering for new students and guardians to sign up for tutoring

### **Automated Invoicing System**

A Python-based backend automation that:
* Pulls session and client data from our Google Sheets input spreadsheet
* Generates professional LaTeX invoices for a specified time period and compiles into PDFs
* Distributes invoices automatically through email to clients
* Generates and sends a summary of each tutor's sessions over the same time period for payment distribution

This system significantly reduces manual billing work and ensures consistency across invoices.

### **Full-Stack Mobile Application** *(Coming Soon)*

The long-term goal is a unified mobile application that connects:
* Communication
* Scheduling
* Payments
* Administration

This webpage will continue operation as the entrypoint for new clients, and the mobile app will act as the central hub for business operations, replacing fragmented manual workflows with reliable private systems.

## 🛠 Tech Stack

* **Frontend:** React, Next.js
* **Backend:** Python, Node.js
* **Database:** PostgreSQL
* **Automation:** Python, LaTeX (pdflatex)
* **Infrastructure:** Docker, Google Cloud Platform
* **Data Source:** Google Sheets
* **Design & Planning:** UML diagrams, technical design documents

## 🧭 Project Status

### ✅ Completed

* Backend automation for invoice generation and distribution
* Google Sheets → LaTeX → PDF billing pipeline

### 🚧 Currently Working On

* Public-facing website (Home, About, FAQ, Contact)
* Client intake and signup workflow

### 🔮 Future Plans

* Mobile app rollout strategy
* Technical design documents and UML diagrams for mobile architecture
* User stories for incremental feature development
* In-app communication between tutors and clients
* Scheduling and availability management
* File sharing and lesson resources
* Administrative dashboards to replace manual tracking

## 🎯 Vision

This project is built with growth in mind. Starting as a tutoring website, evolving into a full business platform, and eventually expanding into a mobile-first ecosystem that supports students, tutors, and administrators seamlessly.

## 📖 License

MIT — feel free to explore, fork, and learn from this project. Attribution appreciated.
