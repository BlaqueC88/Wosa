import { Skeleton } from "./ui/skeleton"

export function Image(params) {
	return (
		<>
			{
				<Skeleton className="h-[20px] w-[100px] rounded-full" />
			}
		</>
	)
}