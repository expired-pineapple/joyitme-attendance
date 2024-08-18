import React from "react"
import Link from 'next/link'

import { IoHomeOutline } from "react-icons/io5"


interface Page{
    name: string,
    href: string
}



interface Props{
    page: Page[],
    heading?: string
    subheading?: string
}

const Breadcrumb: React.FC<Props> = ({page, heading, subheading}) => {
    return(
        <div className="mb-4 print:hidden ">
            <div className="breadcrumb flex items-center text-sm sm:mb-2 my-4 ">
                <Link href="/" className="text-cyan-900 dark:text-white">
                <IoHomeOutline />
                </Link>
                {page.map((p, index) => (
                    <div  key={index}>
                        <span className="mx-2">/</span>
                        <Link className='' href={`${p.href}`}>{p.name}</Link>                        
                    </div>
                ))}
            </div>
            {
                heading && (
                    <div className="flex">
                        <p className="text-xl font-semibold">{heading}</p>
                    </div>
                )
            }
            { subheading && (
                <p className="text-sm font-medium text-gray-400">{subheading}</p>
            )
            }
        </div>

    )
}

export default Breadcrumb