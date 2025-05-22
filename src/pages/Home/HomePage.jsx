import { useEffect, useRef, useState } from "react";
import ChannelPreview from "../../components/ChannelPreview";
import { allChannels, channelNumbers } from "../../data/data";
import { Button, ButtonGroup, ArrowRightIcon } from "flowbite-react";
import ConfirmModal from "../../components/ConfirmModal";
import LoadingIcon from "../../components/LoadingIcon";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const [channelsData, setChannelsData] = useState();
  const prevDataRef = useRef();

  const [openAll, setOpenAll] = useState(false);
  const [closeAll, setCloseAll] = useState(false);
  const bufferRef = useRef(channelsData);
  const openAllRef = useRef();
  const closeAllRef = useRef();
  const { isLoggedIn, setLoggedOut } = useAuth();

  useEffect(() => {
    bufferRef.current = channelsData;
    openAllRef.current = openAll;
    closeAllRef.current = closeAll;
    console.log(isLoggedIn.role);
  }, [channelsData, openAll, closeAll]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/api/scada/getData?channels=${channelNumbers.join(",")}`,
          {
            credentials: "include",
          }
        );
        if (res.status == 401) {
          await setLoggedOut();
          return;
        }

        const data = await res.json(); // tunggu JSON-nya

        // 🔍 Bandingin dengan data sebelumnya
        const prevData = prevDataRef.current;
        // console.log(prevData);
        if (prevData) {
          data.data.forEach((ch, i) => {
            const prev = prevData[i];
            if (prev && ch.val !== prev.val) {
              console.log(
                `Channel ${ch.cnlNum} berubah dari ${prev.val} jadi ${ch.val}`
              );
            }
          });
        }

        // 💾 Simpan data sekarang ke ref
        prevDataRef.current = data.data;

        setChannelsData(data.data);
      } catch (err) {
        setChannelsData(null);
        console.error("Fetch error ");
      }
    };

    const interval = setInterval(() => {
      if (openAll || closeAll) {
        // lagi proses open/close, jangan fetch
        return;
      }

      fetchData(); // polling
    }, 5000);

    return () => clearInterval(interval); // cleanup!
  }, [openAll, closeAll]);

  useEffect(() => {
    if (openAll) openAllFunction();
    if (closeAll) closeAllFunction();
  }, [openAll, closeAll]);

  function openAllFunction() {
    const interval = setInterval(() => {
      if (!openAllRef.current) clearInterval(interval);

      let newData = [...bufferRef.current];

      // update setiap channel
      newData = newData.map((ch) => {
        if (ch.val < 100) {
          return { ...ch, val: ch.val + 1 };
        }
        return ch;
      });

      // update state
      bufferRef.current = newData;
      setChannelsData(newData);

      // cek apakah semua sudah >= 100
      const isDone = newData.every((ch) => ch.val >= 100);
      if (isDone) {
        clearInterval(interval);
        setOpenAll(false);
        console.log("Selesai!");
      }
    }, 150);
  }

  function closeAllFunction() {
    const interval = setInterval(() => {
      if (!closeAllRef.current) clearInterval(interval);

      let newData = [...bufferRef.current];

      // update setiap channel
      newData = newData.map((ch) => {
        if (ch.val > 0) {
          return { ...ch, val: ch.val - 1 };
        }
        return ch;
      });

      // update state
      bufferRef.current = newData;
      setChannelsData(newData);

      // cek apakah semua sudah
      const isDone = newData.every((ch) => ch.val <= 0);
      if (isDone) {
        clearInterval(interval);
        setCloseAll(false);
        console.log("Selesai!");
      }
    }, 150);
  }

  async function sendAllChannels() {
    try {
      for (const ch of bufferRef.current) {
        const res = await fetch("/api/api/scada/sendCommand", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            channelNum: ch.cnlNum, // atau ch.cnlNum
            cmdVal: ch.val,
          }),
        });

        if (res.status == 401) {
          await setLoggedOut();
          return;
        }

        console.log(`Berhasil menyimpan perubahan`);
      }
    } catch (err) {
      setChannelsData(null);
      alert(`Gagal menyimpan perubahan`);
      console.error(`Gagal menyimpan perubahan`);
    }
  }

  if (channelsData === null)
    return (
      <p className="my-[35vh] text-black px-[10vw]">
        Terjadi kesalahan saat membaca data, Coba untuk refresh halaman.
      </p>
    );
  else if (channelsData === undefined)
    return (
      <div className="my-[35vh] text-black">
        <LoadingIcon />
      </div>
    );
  else if (channelsData.length == 0)
    <p className="my-[35vh] text-black">Tidak ada data untuk ditampilkan</p>;

  return (
    <div className="w-full flex flex-col gap-5 md:gap-10 md:max-w-5xl m-auto justify-center my-5 md:my-10 px-5 lg:px-0">
      {isLoggedIn.role === "admin" && (
        <div>
          {isLoggedIn && (
            <div className="list-none mb-5 sm:mb-10 text-sm w-full flex items-center justify-between gap-5 rounded-xl bg-slate-50 border border-slate-300 p-2 sm:p-4">
              <p className="text-lg sm:text-2xl font-bold text-start">
                Jadwal otomatis:
              </p>
              <a
                href="/schedule"
                className="text-start h-full text-white px-5 py-2 rounded-lg bg-slate-600  hover:bg-gray-900 flex gap-3 items-center">
                Buat Jadwal Otomatis <ArrowRightIcon />
              </a>
            </div>
          )}
          <ButtonGroup outline className="flex">
            <ConfirmModal
              disabled={closeAll || openAll}
              btnClassName={
                "flex-1 text-xs md:text-sm px-0 bg-green-50 text-green-900 border-green-900 disabled:bg-white disabled:text-gray-500 duration-200"
              }
              btnText={"Buka semua"}
              text={"Apakah anda yakin ingin membuka semua?"}
              setAnswer={setOpenAll}
            />
            <Button
              disabled={!(openAll || closeAll)}
              onClick={async () => {
                setCloseAll(false);
                setOpenAll(false);
                setTimeout(() => {
                  sendAllChannels();
                }, 200); // 200ms cukup
              }}
              className={`flex-1 text-xs md:text-sm px-0 duration-200 disabled:text-gray-500 ${
                (openAll || closeAll) && "bg-blue-200 text-blue-900"
              }`}>
              Stop
            </Button>
            <ConfirmModal
              disabled={closeAll || openAll}
              btnClassName={
                "flex-1 text-xs md:text-sm px-0 bg-yellow-50 text-yellow-900 border-yellow-900 disabled:bg-white disabled:text-gray-500 duration-200"
              }
              btnText={"Tutup semua"}
              text={"Apakah anda yakin ingin menutup semua?"}
              setAnswer={setCloseAll}
            />
          </ButtonGroup>
        </div>
      )}
      <ul className="w-full grid place-items-center 2xl:grid-cols-3 xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-7">
        {channelsData.map((item, index) => (
          <ChannelPreview
            disabled={openAll || closeAll}
            key={item.cnlNum}
            data={item}
            // prevData={prevChannelsData && prevChannelsData[index]}
            name={
              allChannels.find((ch) => ch.channelNumber == item.cnlNum)
                .channelName
            }
          />
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
