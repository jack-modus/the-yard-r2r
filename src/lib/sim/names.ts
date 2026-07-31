// Horse names, extracted verbatim from reference/rags-to-riches-v6.jsx.
// Hard rule: fictional, real-sounding names only — no real horses.
import { nid, pick } from "./utils";

export const NAMES = [
  "Midnight In Malton","Brandy For Breakfast","Kestrel Republic","The Butcher's Waltz","Ninety Nine Reasons",
  "Quiet Rebellion","Salt Marsh Serenade","Do It For Doris","Gunmetal Sky","Tin Soldier's Lament",
  "Sister Solstice","Latecomer's Luck","Percy's Parade","Ombersley Rocket","Night Train North",
  "Whistle Past Midnight","The Vicar's Dilemma","Copper Kettle Jack","Marmalade Morning","Fenland Drummer",
  "Last Orders Louie","Harbour Lights Hattie","Sixpence For Sorrow","The Quiet Cartographer","Bailey's Bargain",
  "Frost On The Wire","Dancing With Dukes", "A Pocketful Of Rye","Thunder Over Thirsk","Mrs Miggins' Pride",
  "Borrowed Tuxedo","The Ploughman's Boast","Candlelight Convoy","Rascal's Reprieve","Ghost Of Gallowgate",
  "Two Left Feet","Winter's Apprentice","The Poacher's Moon","Spilt Milk Sally","Hackney Empire",
  "Duchess Of Dust","Runaway Curate","Bootlace Bill","The Long Goodbye","Seldom Sober",
  "Paper Lantern Parade","Ashes And Embers","Cathedral Thinking","The Understudy","Field Marshal Fred",
  "Barnacle Bright","Songs For Swinley","Threadneedle Rose","Half Past Trouble","Dry Stone Waller",
  "Lantern Jaw Larry","Pennine Postman","The Optimist's Umbrella","Velvet Thunderclap","Second Breakfast",
  "Wagons East","Molly's Last Word","Ironbridge Echo","The Reluctant Baronet","Skylark Sunday",
  "Chalk Stream Charlie","Bring Me Sunshine","The Gallops Ghost","Damson Gin Dreams","Northern Powerhouse",
  "Tattersalls Tearaway","One More Furlong","The Bishop's Move","Wet Weekend In Wigan","Silver Birch Belle",
  "Hedgerow Highwayman","Not My Circus","Foghorn Fanfare","The Milliner's Son","Race You To Ripon",
  "Barley Twist","Golden Hour Gerty","The Contrary Farrier","Puddle Jumper Pete","Empress Of Etal",
  "Shilling For The Meter","Downhill From Here","The Patient Assassin","Cobbles And Chrome","Firecracker Freda",
  "Overheard In Oakham","The Unlikely Lad","Sea Fret Sonata","Ballad Of Bempton","Knavesmire Nocturne",
  "Roodee Runaround","Tattenham Tearaway","Esher Express","Rowley Mile Rebel","Dip Your Colours",
];

export function takeName(used: Set<string>): string {
  const avail = NAMES.filter(n => !used.has(n));
  const n = avail.length ? pick(avail) : "Bay " + pick(["Colt", "Filly"]) + " " + nid();
  used.add(n);
  return n;
}
