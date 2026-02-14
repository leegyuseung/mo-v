export default function AdminPendingPage() {
    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">등록 대기</h1>
                <p className="text-sm text-gray-500 mt-1">
                    유저가 요청한 스트리머 등록 대기 목록입니다.
                </p>
            </div>
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                <p className="text-gray-400">준비 중입니다.</p>
            </div>
        </div>
    );
}
