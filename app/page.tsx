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

export default function Page() {
    return (
        <div className="h-dvh w-screen p-3 md:p-6 flex flex-col">
            <div className="flex w-full max-w-sm flex-col">
            <Item variant="outline">
                <ItemMedia>
                    <Avatar className="size-12 md:size-14 mb-1">
                        <AvatarImage src="https://github.com/coatt-code.png" />
                        <AvatarFallback><Skeleton className="size-14 rounded-full md:w-14 md:size-14" /></AvatarFallback>
                    </Avatar>
                </ItemMedia>
                <ItemContent>
                    <ItemTitle className="text-lg">Coatt</ItemTitle>
                    <ItemDescription className="mb-1">
                        <Link href="https://github.com/Coatt-code">
                            <GithubIcon fill="#FFFFFF" stroke="none" className="overflow-visible size-4 md:size-5 " size={20}/>
                        </Link>
                    </ItemDescription>
                </ItemContent>
            </Item>
            </div>
            <div className="flex flex-1 flex-col">
                <h1 className="text-center w-full my-6 md:mt-10 text-lg md:text-3xl">My Projects</h1>
                <div className="grid md:grid-cols-3 gap-4 md:gap-5">
                    <Item variant="outline">
                        <ItemMedia variant="icon">
                            <Image src="/blitzcode.png" alt="blitzcode icon" width={100} height={100} className="overflow-hidden" ></Image>
                        </ItemMedia>
                        <ItemContent>
                        <ItemTitle className="text-lg">Blitz Code</ItemTitle>
                        <ItemDescription>
                            Realtime 1v1 coding battles.
                        </ItemDescription>
                        <ButtonGroup className="mt-2">
                                <Button variant="outline" size='sm' asChild>
                                    <Link href="https://github.com/Coatt-code/blitzcode">GitHub</Link>
                                </Button>
                                <Button variant="outline" size='sm' asChild>
                                    <Link href="https://blitzcode.coatt.space/">Visit</Link>
                                </Button>
                        </ButtonGroup>
                        </ItemContent>
                    </Item>
                   <Item variant="outline">
                        <ItemMedia variant="icon">
                        </ItemMedia>
                        <ItemContent>
                        <ItemTitle className="text-lg">Next project</ItemTitle>
                        <ItemDescription>
                            Coming soon...
                        </ItemDescription>
                        <ButtonGroup className="mt-2">
                                <Button variant="secondary" size='sm'>
                                    ...
                                </Button>
                        </ButtonGroup>
                        </ItemContent>
                    </Item>
                </div>
            </div>
        </div>
    );
}
