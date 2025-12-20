'use client'
import { useRouter } from "next/navigation"

const GlobalOrgchart = () => {
    const router = useRouter()
    
    const handleViewChart = () => {
        router.push("/Orgchart")
    }

    const handleBackHome = () => {
        router.push("/")
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white py-20">
                <div className="container mx-auto px-4">
                    <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
                        Sơ Đồ Tổ Chức Toàn Công Ty
                    </h1>
                    <p className="text-xl text-red-100 mb-8 max-w-2xl">
                        Xem toàn bộ cấu trúc tổ chức của công ty, từ lãnh đạo cấp cao đến từng bộ phận
                    </p>
                    <div className="w-20 h-1 bg-white rounded-full"></div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-black text-red-700 mb-2">1894+</div>
                            <p className="text-gray-600">Tổng số nhân viên</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-black text-red-700 mb-2">50+</div>
                            <p className="text-gray-600">Phòng ban & bộ phận</p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-black text-red-700 mb-2">15</div>
                            <p className="text-gray-600">Cấp độ cấp bậc</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black text-gray-900 mb-4">Tính Năng Chính</h2>
                    <p className="text-gray-600 text-lg">
                        Công cụ quản lý toàn diện cho cấu trúc tổ chức lớn
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {[
                        {
                            icon: "👁️",
                            title: "Hiển Thị Toàn Bộ",
                            desc: "Xem tất cả nhân viên, phòng ban và mối quan hệ báo cáo"
                        },
                        {
                            icon: "🔍",
                            title: "Tìm Kiếm Nâng Cao",
                            desc: "Tìm bất kỳ nhân viên nào bằng tên, ID hoặc bộ phận"
                        },
                        {
                            icon: "📊",
                            title: "Phân Tích Chi Tiết",
                            desc: "Xem thống kê và báo cáo chi tiết về cấu trúc"
                        },
                        {
                            icon: "🔄",
                            title: "Cập Nhật Thời Gian Thực",
                            desc: "Dữ liệu luôn đồng bộ và cập nhật liên tục"
                        }
                    ].map((feature, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-xl shadow-md p-8 border-l-4 border-red-700 hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                            <div className="flex items-start gap-4">
                                <span className="text-4xl">{feature.icon}</span>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-red-700 to-red-900 py-20">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">Khám Phá Sơ Đồ Tổ Chức</h2>
                    <p className="text-red-100 text-lg mb-8 max-w-2xl mx-auto">
                        Bắt đầu khám phá cấu trúc tổ chức của chúng tôi ngay bây giờ
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={handleViewChart}
                            className="bg-white text-red-700 font-bold py-3 px-10 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            📊 Xem Sơ Đồ Ngay
                        </button>
                        <button
                            onClick={handleBackHome}
                            className="bg-white/20 text-white font-bold py-3 px-10 rounded-lg hover:bg-white/30 transition-all duration-300 border-2 border-white/40 backdrop-blur-sm"
                        >
                            🏠 Về Trang Chủ
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">💡 Mẹo Sử Dụng</h3>
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex items-start gap-3">
                            <span className="text-blue-500 font-bold">→</span>
                            <span>Giữ phím <strong>Ctrl</strong> và kéo để di chuyển các vị trí trong sơ đồ</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-blue-500 font-bold">→</span>
                            <span>Cuộn chuột để phóng to/thu nhỏ sơ đồ</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-blue-500 font-bold">→</span>
                            <span>Click phải trên một nút để xem thêm tùy chọn</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-blue-500 font-bold">→</span>
                            <span>Sử dụng thanh tìm kiếm để tìm nhân viên cụ thể</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default GlobalOrgchart