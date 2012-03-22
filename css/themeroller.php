<?if(5==3){
// just opening a style tag that will never be shown so we can get formatting in the editor
?> 
	<style>
<?}?>
<?
header('Content-type: text/css');
$baseColor = $_GET["color"]?$_GET["color"]:"#517475";
echo "/* theme based off of: ".$_GET["color"]." */";

class HexColor {
	private $hex;
	
	public function HexColor( $hex )
	{
		if( strpos( $hex, '#' ) === 0 )
			$this->hex = substr( $hex, 1 );
		else
			$this->hex = $hex;
	}
	
	public function getHexString()
	{
		return $this->hex;
	}
	
	public function convertToRGB()
	{
		// first two digits represent red, next two blue, and the last two green
		$red = substr( $this->hex, 0, 2 );
		$green = substr( $this->hex, 2, 2 );
		$blue = substr( $this->hex, 4, 2 );

		// convert from hexadecimal to base 10
		$red = (int) base_convert( $red, 16, 10 );
		$green = (int) base_convert( $green, 16, 10 );
		$blue = (int) base_convert( $blue, 16, 10 );
		
		return new RGBColor( $red, $green, $blue );
	}
	
	public static function isValid( $hex )
	{
		return (bool) preg_match( '/^(#)?[a-zA-Z0-9]{6}$/', $hex );
	}
	
	public function __toString()
	{
		return $this->hex;
	}
}
class RGBColor {
	private $red, $green, $blue;
	
	public function RGBColor( $red, $green, $blue )
	{
		$this->red = $this->clamp( $red );
		$this->green = $this->clamp( $green );
		$this->blue = $this->clamp( $blue );
	}
	
	public function getRed()
	{
		return $this->red;
	}
	
	public function getGreen()
	{
		return $this->green;
	}
	
	public function getBlue()
	{
		return $this->blue;
	}
	
	public function fadeTo( $rgbColor, $percent )
	{
		$newRed = ( 1 - $percent ) * $this->red + $percent * $rgbColor->getRed();
		$newGreen = ( 1 - $percent ) * $this->green + $percent * $rgbColor->getGreen();
		$newBlue = ( 1 - $percent ) * $this->blue + $percent * $rgbColor->getBlue();
		
		return new RGBColor( (int) $newRed, (int) $newGreen, (int) $newBlue );
	}
	
	public function convertToHex()
	{
		$newRed = base_convert( $this->red, 10, 16 );
		$newGreen = base_convert( $this->green, 10, 16 );
		$newBlue = base_convert( $this->blue, 10, 16 );
		
		$newRed = $this->addZero( $newRed );
		$newGreen = $this->addZero( $newGreen );
		$newBlue = $this->addZero( $newBlue );
		
		return new HexColor( $newRed . $newGreen . $newBlue );
	}
	
	private function addZero( $colorValue )
	{
		if( strlen( $colorValue ) == 1 )
			$colorValue = '0' . $colorValue;
		return $colorValue;
	}
	
	private function clamp( $colorValue )
	{
		// clamp colorValue in interval [0, 255]
		return max( 0, min( 255, $colorValue ) );
	}
	
	public function __toString()
	{
		return '(' . $this->red . ', ' . $this->green . ', ' . $this->blue . ')';
	}
}
function getFade($hex,$fade,$type = "hex"){
	$hexColor = new HexColor( $hex );
	
	// target color is white by default
	$targetColor = new RGBColor( 255, 255, 255 );

	// want to darken the color--target is black
	if( $fade < 0 ) {
		$targetColor = new RGBColor( 0, 0, 0 );
		$fade = -$fade; // make fade positive
	}
	
	$rgbColor = $hexColor->convertToRGB();
	
	// fade / 100 is the percentage
	$fadedColor = $rgbColor->fadeTo( $targetColor, $fade / 100 );
	if($type == "hex"){
		return $fadedColor->convertToHex();
	} else {
		// echo $fadedColor;
		return str_replace(array("(",")"),"",$fadedColor);
	}
}
function getFade2($num,$type = "hex"){
	global $baseColor;
	return "#".getFade($baseColor,$num,$type);
}
// positive numbers get lighter, negative numbers get darker
$baseColorLight10 = "#".getFade($baseColor,16.5);
$baseColorLight20 = "#".getFade($baseColor,22);
$baseColorLight80 = "#".getFade($baseColor,80);
$baseColorDark20 = "#".getFade($baseColor,-22);
$baseColorDark80 = "#".getFade($baseColor,-80);
?>

/* @group project specific classes */

.ixf-header {
	background: <?=$baseColor;?>; /* fallback for browsers that don't support gradients */
	background-image: -moz-linear-gradient(100% 100% 90deg, <?=$baseColor;?>, <?=$baseColorLight10;?>);
	background-image: -webkit-gradient(linear, 0% 0%, 0% 100%, from(<?=$baseColorLight10;?>), to(<?=$baseColor;?>));
	filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='<?=$baseColorLight10;?>', endColorstr='<?=$baseColor;?>');
	}
.ixf-subheader {
/*	background: <?=getFade2(16);?> url(../images/ixf-subnav-bg.png);*/
	background: <?=getFade2(16);?>;
	
	-moz-background-size: 4px 4px;
	background-size: 4px 4px;

	border-left-color:<?=$baseColor;?>;
	border-right-color:<?=$baseColor;?>;
	background-image: -moz-linear-gradient(-45deg, 
		transparent,
		transparent 50%,
		rgba(<?=getFade($baseColor,-20,"rgb");?>, .2) 50%, 
		rgba(<?=getFade($baseColor,-20,"rgb");?>, .2) 55%,
		transparent 55%, 
		transparent
	);
	background-image: -webkit-gradient(linear, 0 0, 100% 100%,
		color-stop(.40, transparent), 
		color-stop(.40, rgba(<?=getFade($baseColor,-20,"rgb");?>, .2)),
		color-stop(.55, rgba(<?=getFade($baseColor,-20,"rgb");?>, .2)), 
		color-stop(.55, transparent),
		to(transparent));
	-moz-box-shadow: 0 4px 4px rgba(<?=getFade($baseColor,-20,"rgb");?>, .15) inset;
	-webkit-box-shadow: 0 4px 4px rgba(<?=getFade($baseColor,0,"rgb");?>, .15) inset;
	box-shadow: 0 4px 4px rgba(<?=getFade($baseColor,-0,"rgb");?>, .15) inset;
	}
.ie .ixf-subheader{
	filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0, startColorstr='<?="#".getFade($baseColor,20);?>', endColorstr='<?="#".getFade($baseColor,10);?>');
}
.ixf-panels {
	border-color: <?=$baseColor;?>;
	}

.ixf-nav {
	border-left-color:<?=$baseColor;?>;
	border-right-color:<?=$baseColorLight10;?>;
}
.ixf-nav a {
	border-left-color:<?=$baseColorLight10;?>;
	border-right-color:<?=$baseColor;?>;
	border-bottom-color:<?="#".getFade($baseColor,-20);?>;
	color: <?=$baseColorLight80;?>;
	text-shadow: <?=$baseColorDark20;?> 0 -1px 2px;
	}

.ixf-nav .selected > a {
	background-color: <?=$baseColor;?>;
	background-image: -webkit-gradient(linear, 0% 0%, 0% 100%, from(<?=$baseColor;?>), to(<?=$baseColorLight10;?>));
	background-image: -moz-linear-gradient(100% 100% 90deg, <?=$baseColorLight10;?>, <?=$baseColor;?>);
	filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='<?=$baseColorLight10;?>', endColorstr='<?=$baseColor;?>');
/*	border: 0;*/
/*	padding: 13px 14px;*/
/*	border-bottom: 1px solid #292929;*/
	border-color:<?=getFade2(0);?>;
	text-shadow: <?=getFade2(-50);?> 0 1px 3px;
	}
.ixf-appname a {
	color: <?=$baseColorLight80;?>;
	}
.ixf-appname {
	color: <?=$baseColorLight80;?>;
	text-shadow: <?=$baseColorDark20;?> 0 -1px 0;
	}
a.ixf-tools-link {
	color: <?=$baseColorLight80;?>;
	text-shadow: <?=$baseColorDark20;?> 0 -1px 2px;
	}
.ixf-tools .messagecount {
	background: #8b0000;
	background: -webkit-gradient(linear, left top, left bottom, from(#96620E), to(#C6830F));
	background: -moz-linear-gradient(top, #96620E, #C6830F);
	filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#96620E', endColorstr='#C6830F');
	-webkit-box-shadow: 0 1px 0px <?=$baseColorDark20;?>;
	-moz-box-shadow: 0 1px 0px <?=$baseColorDark20;?>;
	box-shadow: 0 1px 0px <?=$baseColorDark20;?>;
	color: #fff;
	text-shadow: #000 0 1px 0px;
	border:1px solid <?=$baseColorDark20;?>;
	}
.ixf-subnav a {
	color: <?=$baseColorLight80;?>;
	text-shadow: <?=$baseColorDark20;?> 0 1px 3px;
	}
.ixf-actions {
	background: #37441C;
	background: rgba(50, 63, 23, 0.8);
	background/*\**/: none\9; /* IE7/8 hack to clear the background so the below filter will work*/
	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#99000000,endColorstr=#99000000);
	}
/* @end */

.arrow2 { text-shadow: #222 0 1px 2px; color:#AEAEAE; font-size:85%; font-family:arial,sans-serif; display:inline-block; position:relative; top:-1px;
	filter: glow(color=#666666,strength=3);
	
/*filter: dropshadow(color=#222,offX=0,offY=1)*/
}



/*! Tips plugin */
div.ui-tooltip-tip {
	background: <?="#".getFade($baseColor,30);?>;
	}


.ui-tooltip,
.ui-dialog {
	text-shadow: #fff 0 1px 0;
	border-color: <?="#".getFade($baseColor,30);?>;
	-webkit-box-shadow: 0 1px 5px <?="#".getFade($baseColor,0);?>;
	-moz-box-shadow: 0 1px 5px <?="#".getFade($baseColor,0);?>;
	box-shadow: 0 1px 5px <?="#".getFade($baseColor,0);?>;
	}

.ui-tooltip-titlebar, 
.ui-dialog-titlebar {
	background: -webkit-gradient(linear, left top, left bottom, from(<?="#".getFade($baseColor,40);?>), to(<?="#".getFade($baseColor,50);?>));
	background: -moz-linear-gradient( top, <?="#".getFade($baseColor,50);?> 10%, <?="#".getFade($baseColor,40);?> 100%);
	filter:  progid:DXImageTransform.Microsoft.gradient(startColorstr='<?="#".getFade($baseColor,40);?>', endColorstr='<?="#".getFade($baseColor,50);?>');
	text-shadow: 0 -1px 0 <?="#".getFade($baseColor,0);?>;
	}

.ui-tooltip-titlebar, .ui-tooltip-content, .ui-dialog-titlebar, .ui-dialog {
	border-color:<?="#".getFade($baseColor,30);?>;
}

a.ixf-tools-link.menu-arrow:after,.ixf-appname-link:after { /* not supported by IE7 */
	text-shadow: <?="#".getFade($baseColor,-40);?> 0 1px 2px;
	color:<?="#".getFade($baseColor,40);?>;
	}
	
.ixf-subnav .selected > a span:before {
	text-shadow: <?="#".getFade($baseColor,-40);?> 0 0px 3px;
	color:<?="#".getFade($baseColor,90);?>;
}
.ie .ixf-subnav .selected > a span:before {
	border-bottom-color:<?="#".getFade($baseColor,90);?>;
}