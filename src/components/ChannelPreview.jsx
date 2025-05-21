import { ArrowRightIcon, Button, Card } from "flowbite-react";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";

const ChannelPreview = ({ data, name, disabled = false }) => {
  // if (prevData) {
  //   console.log(data.val);
  //   console.log(prevData.val);
  // }

  let fillColor = "";
  if (data.val <= 33) fillColor = "#52b202";
  else if (data.val > 33 && data.val < 67) fillColor = "#ffb703";
  else fillColor = "#e63946";

  return (
    <Card
      href={!disabled ? `/channel/${name}` : ""}
      className={`relative w-full md:max-w-md ${
        disabled && "bg-white cursor-not-allowed hover:bg-white"
      }`}>
      <div className="flex flex-col items-center gap-3">
        <h5 className="flex gap-2 items-center text-xl font-bold tracking-tight text-gray-900">
          {name}
          <Button color={"alternative"} size="sm">
            <ArrowRightIcon width={12} />
          </Button>
        </h5>
        <Gauge
          width={200}
          height={100}
          value={data.val}
          startAngle={-110}
          endAngle={110}
          sx={(theme) => ({
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 20,
            },
            [`& .${gaugeClasses.valueArc}`]: {
              fill: fillColor,
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: theme.palette.text.disabled,
            },
          })}
          text={({ value }) => `${value}%`}
        />
      </div>
      {disabled && <div className="bg-gray-100/40 absolute inset-0"></div>}
    </Card>
  );
};

export default ChannelPreview;
