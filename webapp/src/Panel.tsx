import { lazy, Suspense } from 'react'
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
import FileChecksumUtil from './utilities/FileChecksumUtil'
import ClockUtil from './utilities/ClockUtil'
import ViewBase64EncodedImageUtil from './utilities/ViewBase64EncodedImageUtil'
import EncodeBase64FileUtil from './utilities/EncodeBase64FileUtil'
import CountdownTimer from './utilities/CountDownUtil'
import AlarmUtil from './utilities/AlarmUtil'
import FindAndReplaceUtil from './utilities/FindAndReplaceUtil'
import RegexTesterUtil from './utilities/RegexTesterUtil'
import HashGeneratorUtil from './utilities/HashGeneratorUtil'
import BaseConverterUtil from './utilities/BaseConverterUtil'
import CaseConverterUtil from './utilities/CaseConverterUtil'
import PasswordGeneratorUtil from './utilities/PasswordGeneratorUtil'
import TimestampConverterUtil from './utilities/TimestampConverterUtil'
import JsonMinifyUtil from './utilities/JsonMinifyUtil'
import HtmlEntitiesUtil from './utilities/HtmlEntitiesUtil'
import CronExplainUtil from './utilities/CronExplainUtil'
import TextDiffUtil from './utilities/TextDiffUtil'
import UrlParserUtil from './utilities/UrlParserUtil'
import CsvJsonUtil from './utilities/CsvJsonUtil'
import JwtEncodeUtil from './utilities/JwtEncodeUtil'
import TotpUtil from './utilities/TotpUtil'
import LineToolsUtil from './utilities/LineToolsUtil'
import MarkdownEditorUtil from './utilities/MarkdownEditorUtil'
import AesEncryptUtil from './utilities/AesEncryptUtil'
import RsaKeyPairUtil from './utilities/RsaKeyPairUtil'
import RsaEncryptUtil from './utilities/RsaEncryptUtil'
import ClassicCipherUtil from './utilities/ClassicCipherUtil'
import SubnetUtil from './utilities/SubnetUtil'
import HttpStatusUtil from './utilities/HttpStatusUtil'
import MimeTypesUtil from './utilities/MimeTypesUtil'
import LoremIpsumUtil from './utilities/LoremIpsumUtil'
import SlugUtil from './utilities/SlugUtil'
import CharCodesUtil from './utilities/CharCodesUtil'
import AsciiTableUtil from './utilities/AsciiTableUtil'
import DateDiffUtil from './utilities/DateDiffUtil'
import ContrastUtil from './utilities/ContrastUtil'
import PxRemUtil from './utilities/PxRemUtil'
import GzipUtil from './utilities/GzipUtil'
import ZipBuilderUtil from './utilities/ZipBuilderUtil'
import ZipViewerUtil from './utilities/ZipViewerUtil'
import SamlDecodeUtil from './utilities/SamlDecodeUtil'
import ImageConvertUtil from './utilities/ImageConvertUtil'
import ExifUtil from './utilities/ExifUtil'
import FileSizeUtil from './utilities/FileSizeUtil'
import ChmodUtil from './utilities/ChmodUtil'
import ListCompareUtil from './utilities/ListCompareUtil'
import UnitConvertUtil from './utilities/UnitConvertUtil'
import EmojiPickerUtil from './utilities/EmojiPickerUtil'
import StopwatchUtil from './utilities/StopwatchUtil'
import ColorConvertUtil from './utilities/ColorConvertUtil'
import PercentageUtil from './utilities/PercentageUtil'
import RomanNumeralUtil from './utilities/RomanNumeralUtil'
import UlidUtil from './utilities/UlidUtil'
import KeyCodeUtil from './utilities/KeyCodeUtil'
import BasicAuthUtil from './utilities/BasicAuthUtil'
import IpConvertUtil from './utilities/IpConvertUtil'
import UserAgentUtil from './utilities/UserAgentUtil'
import RandomPortUtil from './utilities/RandomPortUtil'

/**
 * Plotly, mathjs, react-color and react-qr-code are most of the bundle, and
 * each is used by exactly one tool. Loading them on demand keeps them out of
 * the initial download.
 */
const PlotGraph = lazy(() => import('./utilities/PlotGraphUtil'))
const CalculatorUtil = lazy(() => import('./utilities/CalculatorUtil'))
const ColorPickerUtil = lazy(() => import('./utilities/ColorPickerUtil'))
const QRCodeGenerator = lazy(() => import('./utilities/QrCodeUtil'))

export enum PanelType {
  None = 'none',
  Guid = 'UUID generator',
  Ip = 'Public IP address',
  UnixTime = 'Current unix time',
  JwtDecode = 'JWT decoder',
  Base64Encode = 'Base64 encode',
  Base64Decode = 'Base64 decode',
  UrlEncode = 'URL encode',
  UrlDecode = 'URL decode',
  LineCount = 'Word count',
  FindAndReplace = 'Find and replace',
  CountOccurrences = 'Count occurrences',
  FormatJson = 'JSON formatter',
  EscapeString = 'Escape string',
  UnescapeString = 'Unescape string',
  ShaFileChecksum = 'File checksum',
  QrCode = 'QR code generator',
  PlotGraph = 'Function plotter',
  Calculator = 'Calculator',
  Clock = 'Clock',
  Base64EncodeFile = 'File to base64',
  ViewBase64Image = 'Base64 to image',
  CountDownTimer = 'Countdown',
  Alarm = 'Alarm',
  Color = 'Color picker',
  RegexTester = 'Regex tester',
  HashGenerator = 'Hash generator',
  BaseConverter = 'Number base converter',
  CaseConverter = 'Case converter',
  PasswordGenerator = 'Password generator',
  TimestampConverter = 'Timestamp converter',
  JsonMinify = 'JSON minifier',
  HtmlEntities = 'HTML entities',
  CronExplain = 'Cron explainer',
  TextDiff = 'Text diff',
  UrlParser = 'URL parser',
  CsvJson = 'CSV and JSON converter',
  JwtEncode = 'JWT encoder',
  Totp = 'TOTP generator',
  LineTools = 'Sort and dedupe lines',
  MarkdownEditor = 'Markdown editor',
  AesEncrypt = 'AES encryption',
  RsaKeyPair = 'RSA key pair',
  RsaEncrypt = 'RSA encryption',
  ClassicCipher = 'Classic ciphers',
  Subnet = 'Subnet calculator',
  HttpStatus = 'HTTP status codes',
  MimeTypes = 'MIME types',
  LoremIpsum = 'Lorem ipsum',
  Slug = 'Slug generator',
  CharCodes = 'Binary and hex converter',
  AsciiTable = 'ASCII table',
  DateDiff = 'Date difference',
  Contrast = 'Contrast checker',
  PxRem = 'CSS unit converter',
  Gzip = 'Gzip',
  ZipBuilder = 'Create zip',
  ZipViewer = 'Unzip',
  SamlDecode = 'SAML decoder',
  ImageConvert = 'Image converter',
  Exif = 'EXIF viewer',
  FileSize = 'File size converter',
  Chmod = 'Chmod calculator',
  ListCompare = 'Compare lists',
  UnitConvert = 'Unit converter',
  Emoji = 'Emoji picker',
  Stopwatch = 'Stopwatch',
  ColorConvert = 'Color converter',
  Percentage = 'Percentage calculator',
  RomanNumeral = 'Roman numerals',
  Ulid = 'ULID generator',
  KeyCode = 'Keyboard codes',
  BasicAuth = 'Basic auth header',
  IpConvert = 'IP address converter',
  UserAgent = 'User agent parser',
  RandomPort = 'Random port',
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
      case PanelType.FindAndReplace:
        return <FindAndReplaceUtil />
      case PanelType.FormatJson:
        return <FormatJsonUtil />
      case PanelType.EscapeString:
        return <EscapeStringUtil />
      case PanelType.UnescapeString:
        return <UnescapeStringUtil />
      case PanelType.ShaFileChecksum:
        return <FileChecksumUtil />
      case PanelType.QrCode:
        return <QRCodeGenerator />
      case PanelType.PlotGraph:
        return <PlotGraph />
      case PanelType.Calculator:
        return <CalculatorUtil />
      case PanelType.Clock:
        return <ClockUtil />
      case PanelType.Base64EncodeFile:
        return <EncodeBase64FileUtil />
      case PanelType.ViewBase64Image:
        return <ViewBase64EncodedImageUtil />
      case PanelType.CountDownTimer:
        return <CountdownTimer />
      case PanelType.Alarm:
        return <AlarmUtil />
      case PanelType.Color:
        return <ColorPickerUtil />
      case PanelType.RegexTester:
        return <RegexTesterUtil />
      case PanelType.HashGenerator:
        return <HashGeneratorUtil />
      case PanelType.BaseConverter:
        return <BaseConverterUtil />
      case PanelType.CaseConverter:
        return <CaseConverterUtil />
      case PanelType.PasswordGenerator:
        return <PasswordGeneratorUtil />
      case PanelType.TimestampConverter:
        return <TimestampConverterUtil />
      case PanelType.JsonMinify:
        return <JsonMinifyUtil />
      case PanelType.HtmlEntities:
        return <HtmlEntitiesUtil />
      case PanelType.CronExplain:
        return <CronExplainUtil />
      case PanelType.TextDiff:
        return <TextDiffUtil />
      case PanelType.UrlParser:
        return <UrlParserUtil />
      case PanelType.CsvJson:
        return <CsvJsonUtil />
      case PanelType.JwtEncode:
        return <JwtEncodeUtil />
      case PanelType.Totp:
        return <TotpUtil />
      case PanelType.LineTools:
        return <LineToolsUtil />
      case PanelType.MarkdownEditor:
        return <MarkdownEditorUtil />
      case PanelType.AesEncrypt:
        return <AesEncryptUtil />
      case PanelType.RsaKeyPair:
        return <RsaKeyPairUtil />
      case PanelType.RsaEncrypt:
        return <RsaEncryptUtil />
      case PanelType.ClassicCipher:
        return <ClassicCipherUtil />
      case PanelType.Subnet:
        return <SubnetUtil />
      case PanelType.HttpStatus:
        return <HttpStatusUtil />
      case PanelType.MimeTypes:
        return <MimeTypesUtil />
      case PanelType.LoremIpsum:
        return <LoremIpsumUtil />
      case PanelType.Slug:
        return <SlugUtil />
      case PanelType.CharCodes:
        return <CharCodesUtil />
      case PanelType.AsciiTable:
        return <AsciiTableUtil />
      case PanelType.DateDiff:
        return <DateDiffUtil />
      case PanelType.Contrast:
        return <ContrastUtil />
      case PanelType.PxRem:
        return <PxRemUtil />
      case PanelType.Gzip:
        return <GzipUtil />
      case PanelType.ZipBuilder:
        return <ZipBuilderUtil />
      case PanelType.ZipViewer:
        return <ZipViewerUtil />
      case PanelType.SamlDecode:
        return <SamlDecodeUtil />
      case PanelType.ImageConvert:
        return <ImageConvertUtil />
      case PanelType.Exif:
        return <ExifUtil />
      case PanelType.FileSize:
        return <FileSizeUtil />
      case PanelType.Chmod:
        return <ChmodUtil />
      case PanelType.ListCompare:
        return <ListCompareUtil />
      case PanelType.UnitConvert:
        return <UnitConvertUtil />
      case PanelType.Emoji:
        return <EmojiPickerUtil />
      case PanelType.Stopwatch:
        return <StopwatchUtil />
      case PanelType.ColorConvert:
        return <ColorConvertUtil />
      case PanelType.Percentage:
        return <PercentageUtil />
      case PanelType.RomanNumeral:
        return <RomanNumeralUtil />
      case PanelType.Ulid:
        return <UlidUtil />
      case PanelType.KeyCode:
        return <KeyCodeUtil />
      case PanelType.BasicAuth:
        return <BasicAuthUtil />
      case PanelType.IpConvert:
        return <IpConvertUtil />
      case PanelType.UserAgent:
        return <UserAgentUtil />
      case PanelType.RandomPort:
        return <RandomPortUtil />
      default:
        return <div>Invalid selection</div>
    }
  }

  return (
    <Suspense
      fallback={
        <p className="text-sm text-subtle" data-testid="panel-loading">
          Loading…
        </p>
      }
    >
      {renderPanel()}
    </Suspense>
  )
}

export default Panel
