import Navbar from "./Navbar";
import "../App.css";

export default function PageLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <div className="page-content">
          {children}
        </div>
      </main>
    </>
  );
}