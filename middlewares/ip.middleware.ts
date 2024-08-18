import { NextRequest, NextResponse } from 'next/server';
import type { NextFetchEvent } from 'next/server'


import { CustomMiddleware } from './chain'

const WHITELIST_IPS = process.env.WHITELIST_IPS || ['127.0.0.1'];

function ipMiddleware(request: NextRequest) {
  const { ip, nextUrl } = request

  const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'Unknown';
  // console.log(request.headers.get('x-client-cert'), "HERE")


  if (WHITELIST_IPS.includes(clientIP)) {
    return NextResponse.next();
  }

  return new NextResponse(`Access denied ${request.ip}`, { status: 403 });
}

export function middleware(request: NextRequest) {}

export function withChainMiddleware(middleware: CustomMiddleware) {

  
  return async (
    request: NextRequest,
    event: NextFetchEvent,
    response: NextResponse
  ) => {
    // 1. IP Restriction (if enabled)
    const ipResponse = ipMiddleware(request);
    if (ipResponse) {
      return ipResponse; // Block if not in whitelist
    }


    return middleware(request, event, response)
  }
}



