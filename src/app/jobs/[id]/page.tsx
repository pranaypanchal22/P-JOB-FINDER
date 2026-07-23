export default function JobDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Job Detail</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">Job {params.id} detail coming in Phase 2</p>
    </div>
  )
}
