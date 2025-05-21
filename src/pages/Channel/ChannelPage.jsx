import { useEffect, useState } from "react";
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
} from "@mui/x-charts/Gauge";
import { useNavigate, useParams } from "react-router-dom";
import { allChannels } from "../../data/data";
import { ArrowLeftIcon, Button } from "flowbite-react";
import GaugePointer from "../../components/GaugePointer";
import LoadingIcon from "../../components/LoadingIcon";
import { useAuth } from "../../context/AuthContext";

const ChannelPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // get product id from  url
  const channelDetail = allChannels.find(
    (ch) => ch.channelName == decodeURI(id)
  ); // find channle number based on params (channel name)

  const [channel, setChannel] = useState();
  const [isValChanging, setIsValChanging] = useState(false);
  const [mode, setMode] = useState(null); // "up" or "down"
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (channelDetail) {
        try {
          const res = await fetch(
            `/api/api/scada/getData?channels=${channelDetail.channelNumber}`,
            {
              credentials: "include",
            }
          );

          if (res.status == 401) {
            await setLoggedOut();
            return;
          }

          const data = await res.json(); // tunggu JSON-nya
          setChannel(data.data[0].val);
        } catch (err) {
          console.error("Fetch error");
          setChannel(null);
        }
      } else {
        navigate("/not-found");
      }
    };

    const interval = setInterval(() => {
      if (isValChanging) {
        // lagi proses open/close, jangan fetch
        return;
      }

      fetchData(); // polling
    }, 3000);

    return () => clearInterval(interval); // cleanup!
  }, [isValChanging]);

  useEffect(() => {
    if (!isValChanging) return;

    const timer = setTimeout(() => {
      if (channel === 100 && mode === "up") stop();
      if (channel === 0 && mode === "down") stop();
      if (mode === "up" && channel < 100) {
        setChannel((prev) => prev + 1);
      } else if (mode === "down" && channel >= 1) {
        setChannel((prev) => prev - 1);
      } else {
        setIsValChanging(false); // stop kalau udah mentok
      }
    }, 100); // delay-nya

    return () => clearTimeout(timer);
  }, [channel, isValChanging, mode]);

  async function stop() {
    setIsValChanging(false);

    try {
      const res = await fetch("/api/api/scada/sendCommand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          channelNum: channelDetail.channelNumber,
          cmdVal: channel,
        }),
      });

      if (res.status == 401) {
        await setLoggedOut();
        return;
      }

      console.log("Berhasil merubah channel");
    } catch (err) {
      console.error("Gagal merubah nilai");
      alert(`Gagal menyimpan perubahan`);
    }
  }

  if (channel === undefined)
    return (
      <div className="my-[35vh] text-black">
        <LoadingIcon />
      </div>
    );
  if (channel === null)
    return (
      <p className="my-[35vh] text-black px-[10vw]">
        Terjadi kesalahan saat membaca data, Coba untuk refresh halaman.
      </p>
    );

  return (
    <>
      <div className="relative w-full md:max-w-5xl m-auto flex justify-between p-3 py-5">
        <Button
          onClick={() => navigate(-1)}
          className="absolute cursor-pointer"
          color={"alternative"}>
          <ArrowLeftIcon />
        </Button>
        <h1 className="flex-1 font-bold text-3xl">
          {channelDetail.channelName}
        </h1>
      </div>
      <div className=" w-screen h-[70vh] flex flex-col items-center justify-center text-center text-2xl">
        <div className="flex flex-col items-center">
          <GaugeContainer
            width={200}
            height={150}
            value={channel}
            startAngle={-110}
            endAngle={110}
            innerRadius={50}>
            <GaugeReferenceArc />
            <GaugeValueArc />
            <GaugePointer />
          </GaugeContainer>
          <p>{channel}%</p>
        </div>

        {isLoggedIn.role === "admin" && (
          <div className="flex gap-4 mt-24 justify-center w-full text-xl px-[5vw]">
            <Button
              disabled={isValChanging || channel === 100}
              className="h-20"
              color={"green"}
              size="xl"
              onClick={() => {
                if (isValChanging) return;
                setMode("up");
                setIsValChanging(true);
              }}>
              Buka
            </Button>
            <Button
              disabled={!isValChanging}
              className={`duration-200 h-20 ${
                isValChanging && "border-black scale-110"
              }`}
              color={"alternative"}
              size="xl"
              onClick={stop}>
              Stop
            </Button>
            <Button
              disabled={isValChanging || channel === 0}
              className="h-20"
              color={"yellow"}
              size="xl"
              onClick={() => {
                if (isValChanging) return;
                setMode("down");
                setIsValChanging(true);
              }}>
              Tutup
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default ChannelPage;
