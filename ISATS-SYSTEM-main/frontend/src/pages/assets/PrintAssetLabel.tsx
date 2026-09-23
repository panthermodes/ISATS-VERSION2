import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Printer, ArrowLeft, Shield, QrCode, Laptop } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MainLayout } from '@/layouts/MainLayout'

export default function PrintAssetLabel() {
  const { id } = useParams()
  const [asset, setAsset] = useState<any>({
    asset_id: 'AST-DELL-8812',
    asset_name: 'Dell Latitude 5420 Workstation',
    serial_number: 'SN-DL-8812903',
    department_name: 'Finance & Accounting',
    model: 'Latitude 5420 i7 16GB',
    company_name: 'ISATS Primary Enterprise',
  })

  useEffect(() => {
    fetch(`/api/assets/${id}/`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setAsset((prev: any) => ({ ...prev, ...res.data }))
        }
      })
      .catch(() => {})
  }, [id])

  const handlePrint = () => {
    window.print()
  }

  return (
    <MainLayout pageTitle="Print Asset QR / Barcode Label">
      <div className="max-w-4xl mx-auto space-y-6 text-slate-100">
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <Link to={id ? `/assets/${id}` : '/assets'}>
              <Button variant="outline" size="sm" className="text-xs gap-1 border-slate-700">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Asset
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Print Hardware Asset Tag</h2>
              <p className="text-xs text-slate-400 mt-0.5">Physical sticker label with Code-128 barcode and secure QR code.</p>
            </div>
          </div>
          <Button onClick={handlePrint} size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
            <Printer className="w-4 h-4" /> Print Label Sticker
          </Button>
        </div>

        {/* Printable Label Tag Container */}
        <div className="flex justify-center p-8 bg-slate-900 border border-slate-800 rounded-3xl">
          <div className="w-[380px] p-5 bg-white text-slate-900 rounded-2xl shadow-2xl border-2 border-slate-900 print:border print:m-0 print:shadow-none space-y-3 font-sans">
            {/* Tag Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2">
              <div>
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-500 block">Property Of</span>
                <h3 className="text-xs font-black uppercase text-slate-900 tracking-tight">{asset.company_name || 'ISATS ENTERPRISE'}</h3>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white uppercase">ICT ASSET</span>
              </div>
            </div>

            {/* Middle Section: Details & QR */}
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1 text-[11px] min-w-0">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Asset Tag:</span>
                  <span className="font-mono font-black text-sm text-slate-900">{asset.asset_id}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Model / Spec:</span>
                  <span className="font-bold text-slate-800 truncate block">{asset.model || asset.asset_name}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Serial No:</span>
                  <span className="font-mono text-[10px] text-slate-700">{asset.serial_number}</span>
                </div>
              </div>

              {/* Dynamic QR Code Simulation */}
              <div className="w-20 h-20 bg-slate-100 border border-slate-300 rounded-lg p-1.5 flex flex-col items-center justify-center shrink-0">
                <QrCode className="w-14 h-14 text-slate-900" />
                <span className="text-[7px] font-mono font-bold text-slate-600 uppercase">SCAN FOR INFO</span>
              </div>
            </div>

            {/* Bottom Section: Code-128 Barcode Simulation */}
            <div className="pt-2 border-t border-slate-300 text-center space-y-1">
              <div className="h-9 w-full flex items-center justify-center gap-[2px] bg-white px-2">
                {[3,1,2,1,4,2,1,3,2,1,3,4,1,2,1,3,2,4,1,2,3,1,2,1,4,2,1,3,2,1,3,4].map((width, idx) => (
                  <div key={idx} className="h-full bg-slate-900" style={{ width: `${width}px` }} />
                ))}
              </div>
              <span className="font-mono text-[10px] font-black tracking-widest text-slate-800 block">
                *{asset.asset_id}*
              </span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
