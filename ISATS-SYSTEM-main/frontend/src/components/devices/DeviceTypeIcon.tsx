import React from 'react'
import {
  Laptop, Monitor, Server, Network, Cpu, CreditCard,
  Printer, ShieldCheck, Zap, PhoneCall, HardDrive,
  Layers, Tv, Radio, Box, Smartphone, Tablet, QrCode
} from 'lucide-react'

interface DeviceTypeIconProps {
  slugOrIcon?: string
  iconName?: string
  className?: string
}

export function DeviceTypeIcon({ slugOrIcon = '', iconName = '', className = 'w-5 h-5' }: DeviceTypeIconProps) {
  const key = (iconName || slugOrIcon || '').toLowerCase()

  if (key.includes('laptop')) return <Laptop className={className} />
  if (key.includes('desktop') || key.includes('monitor') || key.includes('aio')) return <Monitor className={className} />
  if (key.includes('tablet')) return <Tablet className={className} />
  if (key.includes('smartphone') || key.includes('mobile')) return <Smartphone className={className} />
  if (key.includes('server') || key.includes('rack') || key.includes('datacenter')) return <Server className={className} />
  if (key.includes('router') || key.includes('network') || key.includes('switch') || key.includes('firewall')) return <Network className={className} />
  if (key.includes('pos') || key.includes('payment') || key.includes('card')) return <CreditCard className={className} />
  if (key.includes('printer') || key.includes('scanner') || key.includes('printing')) return <Printer className={className} />
  if (key.includes('cctv') || key.includes('camera') || key.includes('security') || key.includes('biometric')) return <ShieldCheck className={className} />
  if (key.includes('power') || key.includes('ups') || key.includes('inverter') || key.includes('zap')) return <Zap className={className} />
  if (key.includes('phone') || key.includes('communication') || key.includes('voip')) return <PhoneCall className={className} />
  if (key.includes('storage') || key.includes('nas') || key.includes('hdd') || key.includes('ssd')) return <HardDrive className={className} />
  if (key.includes('infrastructure') || key.includes('fiber') || key.includes('layers')) return <Layers className={className} />
  if (key.includes('tv') || key.includes('signage')) return <Tv className={className} />
  if (key.includes('radio') || key.includes('iot')) return <Radio className={className} />
  if (key.includes('qr') || key.includes('barcode')) return <QrCode className={className} />

  return <Box className={className} />
}
