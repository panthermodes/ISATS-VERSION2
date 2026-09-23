import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Printer, ArrowLeft, QrCode, Download } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MainLayout } from '@/layouts/MainLayout'

export default function BatchPrintLabels() {
  const [assets, setAssets] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/assets/')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data && res.data.length > 0) {
          setAssets(res.data)
        } else {
          // Fallback sample data
          setAssets([
            { asset_id: 'AST-DELL-8812', asset_name: 'Dell Latitude 5420', serial_number: 'SN-DL-8812903', department: 'Finance' },
            { asset_id: 'AST-HP-9921', asset_name: 'HP EliteBook 840 G8', serial_number: 'SN-HP-9921004', department: 'ICT Support' },
            { asset_id: 'AST-SRV-01', asset_name: 'Dell PowerEdge R740', serial_number: 'SN-PE-019923', department: 'Infrastructure' },
            { asset_id: 'AST-POS-104', asset_name: 'Sunmi T2 POS Terminal', serial_number: 'SN-SNM-104882', department: 'Retail' },
            { asset_id: 'AST-SW-48P', asset_name: 'Cisco Catalyst 2960X', serial_number: 'SN-CSC-48P11', department: 'Networking' },
            { asset_id: 'AST-MON-27', asset_name: 'Dell UltraSharp 27"', serial_number: 'SN-DL-27U992', department: 'Design' },
          ])
        }
      })
      .catch(() => {})
  }, [])

  const handlePrint = () => {
    window.print()
  }

  return (
    <MainLayout pageTitle="Batch Print Hardware Labels">
      <div className="space-y-6 max-w-6xl mx-auto text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <Link to="/assets">
              <Button variant="outline" size="sm" className="text-xs gap-1 border-slate-700">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Assets
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Batch Asset Label Sheet</h2>
              <p className="text-xs text-slate-400 mt-0.5">Print multiple 2" × 1" thermal sticker tags on standard A4/Letter sheets.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handlePrint} size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
              <Printer className="w-4 h-4" /> Print Full Sheet ({assets.length} Labels)
            </Button>
          </div>
        </div>

        {/* Printable Grid Sheet */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 print:p-0 print:border-0 print:bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
            {assets.map((asset) => (
              <div
                key={asset.asset_id}
                className="p-3 bg-white text-slate-900 rounded-xl border border-slate-300 shadow-sm print:shadow-none print:border print:m-0 space-y-2 font-sans"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-1">
                  <span className="text-[8px] font-black tracking-widest uppercase text-slate-700">ISATS PROPERTY</span>
                  <span className="text-[7px] font-bold px-1 py-0.2 bg-slate-900 text-white rounded">ICT ASSET</span>
                </div>

                {/* Body */}
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5 text-[9px] min-w-0">
                    <div className="font-mono font-black text-xs text-slate-900 truncate">{asset.asset_id}</div>
                    <div className="font-semibold text-slate-800 truncate">{asset.asset_name}</div>
                    <div className="font-mono text-[8px] text-slate-600 truncate">S/N: {asset.serial_number}</div>
                  </div>
                  <div className="w-12 h-12 bg-slate-50 border border-slate-300 rounded p-1 flex items-center justify-center shrink-0">
                    <QrCode className="w-9 h-9 text-slate-900" />
                  </div>
                </div>

                {/* Barcode */}
                <div className="pt-1 border-t border-slate-200 text-center">
                  <div className="h-5 w-full flex items-center justify-center gap-[1.5px] px-1">
                    {[2,1,3,1,2,3,1,2,1,3,2,1,2,3,1,2,1,3,2,1,2,3,1,2].map((w, idx) => (
                      <div key={idx} className="h-full bg-slate-900" style={{ width: `${w}px` }} />
                    ))}
                  </div>
                  <span className="font-mono text-[8px] font-bold text-slate-700">*{asset.asset_id}*</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
