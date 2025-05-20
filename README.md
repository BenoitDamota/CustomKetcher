# CustomKetcher

CustomKetcher is a **custom fork** of [Ketcher v3.1.0](https://github.com/epam/ketcher), an open-source web-based chemical structure editor.
This repository includes **modifications tailored to the needs of a web application** for NMR spectrum prediction and visualization, developed as part of a Master’s internship at **LERIA (University of Angers)**.

> 🔗 The complete application, including the **frontend**, **Flask backend**, **NMR predictor integration**, and **deployment system**, is available here:
> 👉 [PredictionRMN GitHub Repository](https://github.com/KreeZeG123/PredictionRMN)

## 📌 Purpose of this Repository

This repository serves two main purposes:

- **Customize Ketcher’s internal behavior** to match the specific needs of the PredictionRMN project:
  - Enable/disable certain internal tools and features
  - Inject custom UI elements or logic

- **Develop the frontend UI of the PredictionRMN application** within a Ketcher-embedded environment:
  - Display molecular structures interactively
  - Enable user-driven interaction between the molecule and its predicted spectrum
  - Provide a polished UI ready to be built as a static site

## 🏗️ Repository Structure

- **Branch [`custom-ketcher-v3.1.0`](https://github.com/KreeZeG123/CustomKetcher/tree/custom-stable-v3.1.0)**
  Contains only **modifications made to the original Ketcher packages** (core, react, standalone, etc.), based on the official v3.1.0 release.

- **Branch [`custom-ketcher-v3.1.0-with-app`](https://github.com/KreeZeG123/CustomKetcher/tree/custom-stable-v3.1.0-with-app)**
  Merges the customized Ketcher core with a dedicated frontend application located in [`/example`](./example), built using React and Vite.
  This branch is used for the final UI development and deployment.

## 📁 Key Components

| Path / File       | Description |
|-------------------|-------------|
| `packages/`        | Forked and modified original Ketcher packages |
| `example/`         | Custom frontend application UI (React/Vite, built to static assets) |
| `README.md`        | This file |
| `LICENSE`          | Apache 2.0 license (from original Ketcher) |

---

## 🔗 Link to Main Application

The final application code using this frontend is available in the following repository:
👉 [KreeZeG123/PredictionRMN](https://github.com/KreeZeG123/PredictionRMN)

This separate repository includes:

- Flask backend
- NMR predictor (or simulated module)
- Complete frontend integration (built from this repository’s `/example`)
- Deployment scripts and configuration

---

## ⚙️ Running and Building the Frontend

```bash
# From the root of this repository
npm install
npm run build               # Required at least once, even for run dev
cd example
npm run dev:standalone      # Start dev server
````

---

## 👤 Author

This project was developed by [**Yamis MANFALOTI**](https://github.com/KreeZeG123)
as part of a **Master’s internship** at the **LERIA Laboratory, University of Angers**, France.

---

## 📄 License

This repository is based on [Ketcher](https://github.com/epam/ketcher), which is licensed under the **Apache License 2.0**.
All custom contributions in this fork are compliant with the same license.

---

## 🧪 Technologies Used

* [React](https://reactjs.org/)
* [Vite](https://vitejs.dev/)
* [Plotly.js](https://plotly.com/javascript/)
* [Ketcher](https://github.com/epam/ketcher)
* [Axios](https://axios-http.com/) (for HTTP requests from the frontend)
* [MUI (Material UI)](https://mui.com/) (for UI components and styling)
* [Flask](https://flask.palletsprojects.com/) (used in the PredictionRMN repository)
* [RDKit](https://www.rdkit.org/) (used in backend molecular processing)
* [Scipy](https://scipy.org/) (used in backend spectra processing)
* [Jcamp](https://pypi.org/project/jcamp/) (used in backend to load JCAMP-DX files)

---

## ✅ Project Status

🎯 This repository is **stable and production-ready**, and it is actively used in the final PredictionRMN application.
Future updates may occur based on new features or compatibility with future Ketcher versions.

---

## 📬 Contact

For questions or feedback regarding this repository or the PredictionRMN project, feel free to contact the developer **Yamis MANFALOTI** ([KreeZeG123](https://github.com/KreeZeG123))
