import { Card, CardContent } from "@/components/ui";

export default function Loading() {
    return (
        <div className="space-y-6">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
                    <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                <div className="h-10 w-36 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                    <Card key={i} variant="glass" className="h-full border-primary-500/10">
                        <CardContent className="p-0">
                            {/* Image Placeholder */}
                            <div className="h-40 bg-gray-200 dark:bg-gray-800/50 animate-pulse rounded-t-xl" />

                            {/* Content Placeholder */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-2 w-full">
                                        {/* Brand + Model */}
                                        <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                        {/* Price */}
                                        <div className="h-6 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {/* Status Badge */}
                                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                                    </div>
                                </div>

                                {/* Specs Row */}
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                    <div className="h-4 w-14 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
