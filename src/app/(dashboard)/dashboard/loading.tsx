import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div>
                <div className="h-8 w-48 bg-gray-800/50 rounded-lg mb-2"></div>
                <div className="h-4 w-64 bg-gray-800/50 rounded-lg"></div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Card key={i} variant="glass">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-10 w-10 bg-gray-700/50 rounded-lg"></div>
                                <div className="h-6 w-12 bg-gray-700/50 rounded-full"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-gray-700/50 rounded"></div>
                                <div className="h-8 w-16 bg-gray-700/50 rounded"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Leads Skeleton */}
                <Card variant="glass" className="h-[400px]">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div className="h-6 w-32 bg-gray-700/50 rounded"></div>
                            <div className="h-8 w-24 bg-gray-700/50 rounded-lg"></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-gray-700/50 rounded-full"></div>
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 w-32 bg-gray-700/50 rounded"></div>
                                        <div className="h-3 w-24 bg-gray-700/50 rounded"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Vehicles Skeleton */}
                <Card variant="glass" className="h-[400px]">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div className="h-6 w-32 bg-gray-700/50 rounded"></div>
                            <div className="h-8 w-24 bg-gray-700/50 rounded-lg"></div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="bg-gray-800/30 rounded-xl p-3 h-40"></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
