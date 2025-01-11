import GuidUtil from './utilities/GuidUtil'
import PublicIp from './utilities/PublicIpUtil'
import UnixTimeUtil from './utilities/UnixTimeUtil'
import JwtDecodeUtil from './utilities/JwtDecodeUtil'
import Base64EncodeUtil from './utilities/Base64EncodeUtil'
import Base64DecodeUtil from './utilities/Base64DecodeUtil'
import UrlEncodeUtil from './utilities/UrlEncodeUtil'
import UrlDecodeUtil from './utilities/UrlDecodeUtil'
import LineCountUtil from './utilities/LineCountUtil'
import CountOccurrences from './utilities/CountOccurrences'
import FormatJsonUtil from './utilities/FormatJsonUtil'
import EscapeStringUtil from './utilities/EscapeStringUtil'
import UnescapeStringUtil from './utilities/UnescapeStringUtil'
import ShaFileChecksumUtil from './utilities/ShaFileChecksumUtil'
import QRCodeGenerator from './utilities/QrCodeUtil'
import PlotGraph from './utilities/PlotGraphUtil'
import CalculatorUtil from './utilities/CalculatorUtil'

export enum PanelType {
  None = 'none',
  Guid = 'Guid generator',
  Ip = 'Public ip',
  UnixTime = 'Unix time',
  JwtDecode = 'Jwt decode',
  Base64Encode = 'Base64 encode',
  Base64Decode = 'Base64 decode',
  UrlEncode = 'Url encode',
  UrlDecode = 'Url decode',
  LineCount = 'Text stats',
  FindAndReplace = 'Find and replace',
  CountOccurrences = 'Count occurrences',
  FormatJson = 'Format json',
  EscapeString = 'Escape string',
  UnescapeString = 'Unescape string',
  ShaFileChecksum = 'SHA file checksum',
  QrCode = 'Qr code',
  PlotGraph = 'Plot graph',
  Calculator = 'Calculator',
}

function Panel({ selectedPanel }: { selectedPanel: PanelType }) {
  const renderPanel = () => {
    switch (selectedPanel) {
      case PanelType.None:
        return <div>No panel selected</div>
      case PanelType.Guid:
        return <GuidUtil />
      case PanelType.Ip:
        return <PublicIp />
      case PanelType.UnixTime:
        return <UnixTimeUtil />
      case PanelType.JwtDecode:
        return <JwtDecodeUtil />
      case PanelType.Base64Encode:
        return <Base64EncodeUtil />
      case PanelType.Base64Decode:
        return <Base64DecodeUtil />
      case PanelType.UrlEncode:
        return <UrlEncodeUtil />
      case PanelType.UrlDecode:
        return <UrlDecodeUtil />
      case PanelType.LineCount:
        return <LineCountUtil />
      case PanelType.CountOccurrences:
        return <CountOccurrences />
      case PanelType.FormatJson:
        return <FormatJsonUtil />
      case PanelType.EscapeString:
        return <EscapeStringUtil />
      case PanelType.UnescapeString:
        return <UnescapeStringUtil />
      case PanelType.ShaFileChecksum:
        return <ShaFileChecksumUtil />
      case PanelType.QrCode:
        return <QRCodeGenerator />
      case PanelType.PlotGraph:
        return <PlotGraph />
      case PanelType.Calculator:
        return <CalculatorUtil />
      default:
        return <div>Invalid selection</div>
    }
  }

  return renderPanel()
}

export default Panel
