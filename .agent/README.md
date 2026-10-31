# SlideCraft — Hệ Thống Tri Thức Dự Án (.agent/)

---

Hệ thống tài liệu tri thức (Agent Memory & Knowledge Base) được thiết kế theo chuẩn **Antigravity Agent Protocol** dành cho dự án **SlideCraft (PowerPoint Editor)**.

## 📂 Cấu Trúc Thư Mục Tri Thức

```
.agent/
├── memory/                      # Ký ức bền vững & thông tin cốt lõi
│   ├── constitution.md          # Pháp lệnh tối cao & quy định bất khả xâm phạm
│   ├── architecture.md          # Kiến trúc Hybrid PPTX, SQLite, Real-time Presence
│   ├── deployment.md            # Thông số VPS, IP, SSH, Nginx Host, SSL, .env
│   ├── decision_log.md          # Nhật ký các quyết định kiến trúc quan trọng
│   └── issue_resolutions.md     # Nhật ký xử lý sự cố (TDZ bug, PowerShell, CORS...)
│
├── rules/                       # Quy chuẩn bắt buộc tuân thủ
│   ├── coding_conventions.md    # Chuẩn viết mã Backend (FastAPI) & Frontend (Fabric.js)
│   └── security_policy.md       # Chính sách bảo mật, RBAC Canva và an toàn dữ liệu
│
├── workflows/                   # Quy trình làm việc tự động hóa
│   ├── deploy.md                # Quy trình deploy lên VPS https://ppt-editor.thuc.me
│   ├── check-status.md          # Kiểm tra trạng thái máy chủ Local & VPS
│   └── fix-bug.md               # Quy trình debug và sửa lỗi chuẩn hóa
│
└── instructions/                # Hướng dẫn kỹ thuật chuyên sâu theo stack
    ├── backend-fastapi.md       # Chi tiết tầng API, SQLite & Hybrid LibreOffice Engine
    └── frontend-canva.md        # Chi tiết tầng giao diện SPA, Fabric.js & Canvas Guard
```

## 🚀 Cách Sử Dụng Cho Agent & Developers
- Trước khi bắt đầu bất kỳ task nào, hãy đọc file `constitution.md` và `architecture.md`.
- Khi cần deploy lên VPS, tuân thủ các bước trong `workflows/deploy.md` và `memory/deployment.md`.
- Khi gặp lỗi hoặc chuẩn bị sửa bug, đối chiếu với `memory/issue_resolutions.md` để tránh lặp lại các lỗi đã được giải quyết.
