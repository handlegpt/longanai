import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = new URL(request.url);
  const queryString = url.search;
  
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';
  const targetUrl = `${backendUrl}/api/${path}${queryString}`;
  
  // 暂时禁用日志输出，减少日志噪音
  // console.log(`🔧 Proxying GET request to: ${targetUrl}`);
  
  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = new URL(request.url);
  const queryString = url.search;
  
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';
  const targetUrl = `${backendUrl}/api/${path}${queryString}`;
  
  // 暂时禁用日志输出，减少日志噪音
  // console.log(`🔧 Proxying POST request to: ${targetUrl}`);
  
  try {
    const body = await request.json();
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = new URL(request.url);
  const queryString = url.search;
  
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';
  const targetUrl = `${backendUrl}/api/${path}${queryString}`;
  
  // 暂时禁用日志输出，减少日志噪音
  // console.log(`🔧 Proxying PUT request to: ${targetUrl}`);
  
  try {
    const body = await request.json();
    const response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = new URL(request.url);
  const queryString = url.search;
  
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';
  const targetUrl = `${backendUrl}/api/${path}${queryString}`;
  
  // 暂时禁用日志输出，减少日志噪音
  // console.log(`🔧 Proxying DELETE request to: ${targetUrl}`);
  
  try {
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request' },
      { status: 500 }
    );
  }
}
