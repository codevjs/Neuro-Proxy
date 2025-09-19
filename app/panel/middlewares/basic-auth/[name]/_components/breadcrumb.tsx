'use client';

import {Breadcrumbs, BreadcrumbItem} from '@heroui/breadcrumbs';

export default function App(props: {name: string}) {
    return (
        <Breadcrumbs variant='solid'>
            <BreadcrumbItem href='/panel/dashboard'>Panel</BreadcrumbItem>
            <BreadcrumbItem
                href='/panel/middlewares'
                isDisabled={true}
            >
                Middlewares
            </BreadcrumbItem>
            <BreadcrumbItem href='/panel/middlewares/basic-auth'>Basic Auth</BreadcrumbItem>
            <BreadcrumbItem>{props.name}</BreadcrumbItem>
        </Breadcrumbs>
    );
}
