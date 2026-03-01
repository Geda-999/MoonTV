/* eslint-disable no-console,@typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // 解析请求体
    const body = await req.json();
    const name = body?.name;
    const value = body?.value;

    // 参数校验
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: '名称不能为空' }, { status: 400 });
    }
    if (!value) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }

    // 检查API KEY
    const apiUrl = process.env.OPENAI_API;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: '服务器缺少API密钥配置' }, { status: 500 });
    }
    if (!apiUrl) {
      return NextResponse.json({ error: '服务器缺少API URL配置' }, { status: 500 });
    }

    // 调用远端API
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ kvName: name, textValue: value }),
    });
    // console.log('远端API响应', res);
    

    // 远端API响应校验
    if (!res.ok) {
      let errMsg = '远程服务异常';
      try {
        const errorResp = await res.json();
        if (errorResp?.error) {
          errMsg = errorResp.error;
        }
      } catch {
        // ignore: 保留默认错误信息
      }
      return NextResponse.json({ error: errMsg }, { status: res.status });
    }

    // // 可选：获取远端返回内容用于前端逻辑判断
    // const remoteResp = await res.json();

    // // 这里可以根据实际业务，返回更多数据，如果远端返回 error 可以额外判断
    // if (remoteResp?.error) {
    //   return NextResponse.json({ error: remoteResp.error }, { status: 500 });
    // }
    // 可选：获取远端返回内容用于前端逻辑判断
    await res.json();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('存储接口异常', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}


export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kvName = searchParams.get('name');
    if (!kvName) {
      return NextResponse.json({ error: 'name不能为空' }, { status: 400 });
    }

    // 检查API KEY
    const apiUrl = process.env.OPENAI_API;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: '服务器缺少API密钥配置' }, { status: 500 });
    }
    if (!apiUrl) {
      return NextResponse.json({ error: '服务器缺少API URL配置' }, { status: 500 });
    }

    const res = await fetch(`${apiUrl}?kvName=${encodeURIComponent(kvName)}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: '远程服务异常' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('获取接口异常', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}


