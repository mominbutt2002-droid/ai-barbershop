import { AdminNav } from "@/components/AdminNav";

export default function AdminPanelLayout({ children }) {
  return (
    <>
      <div className="wrap admin-bar">
        <AdminNav />
      </div>
      {children}
    </>
  );
}
