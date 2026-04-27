import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Plus, ArrowUpRightIcon } from "lucide-react"
import { GithubIcon } from "@/components/icons/simple-icons-github"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { ButtonGroup } from "@/components/ui/button-group"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"


export default function Page() {
    return (
        <div className="h-dvh w-screen p-3 md:p-6 flex flex-col">
            <h1 className="font-mono text-center mt-10 pr-10">
                <span className="opacity-20">https://</span>
                coatt.space
            </h1>
            <div className="mt-10">
                <Item variant='outline' className="max-w-md">
                    <ItemContent>
                        <ItemTitle className="text-xl">Sudoku Ranked</ItemTitle>
                        <Image
                            src='/sudoku_cover.png'
                            width={630}
                            height={315}
                            alt="sudoku cover image"
                            className="rounded-sm h-md"
                            
                        />
                        
                        <Button variant='secondary' className="mt-2 font-semibold" size='lg' asChild>
                            <Link href='/sudoku'>Play</Link>
                        </Button>
                    </ItemContent>
                </Item>
            </div>
        </div>
    );
}
