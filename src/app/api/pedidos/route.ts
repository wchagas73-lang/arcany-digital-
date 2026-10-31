import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request:Request){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return NextResponse.json({error:"O recebimento de pedidos ainda não foi ativado pelo administrador da plataforma."},{status:503});
 let body: any;try{body=await request.json();}catch{return NextResponse.json({error:"Pedido inválido."},{status:400});}
 const slug=String(body.slug||"").slice(0,100);
 const customer_name=String(body.customer_name||"").trim().slice(0,120);
 const customer_phone=String(body.customer_phone||"").trim().slice(0,40);
 const requested=Array.isArray(body.items)?body.items.slice(0,50):[];
 if(!slug||!customer_name||!customer_phone||!requested.length)return NextResponse.json({error:"Informe loja, nome, telefone e itens."},{status:400});
 const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:store,error}=await admin.from("public_storefronts").select("id,organization_id,project_id,title,config").eq("slug",slug).eq("published",true).maybeSingle();
 if(error||!store)return NextResponse.json({error:"Loja não encontrada."},{status:404});
 const products=Array.isArray(store.config?.products)?store.config.products:[];
 const items=[];let total=0;
 for(const line of requested){
  const product=products.find((p:any)=>p.id===String(line.product_id));
  const quantity=Number(line.quantity);
  if(!product||!Number.isFinite(quantity)||quantity<=0||quantity>999)return NextResponse.json({error:"Um dos itens do pedido é inválido."},{status:400});
  const price=Number(product.price);
  if(!Number.isFinite(price)||price<0)return NextResponse.json({error:"Preço de produto inválido."},{status:400});
  total+=price*quantity;items.push({product_id:product.id,name:String(product.name).slice(0,160),quantity,unit_price:price,line_total:price*quantity});
 }
 const {data:order,error:orderError}=await admin.from("store_orders").insert({organization_id:store.organization_id,project_id:store.project_id,customer_name,customer_phone,items,total,status:"recebido",payment_status:"pendente"}).select("id").single();
 if(orderError)return NextResponse.json({error:"Não foi possível registrar o pedido."},{status:500});
 return NextResponse.json({order_id:order.id,total});
}
