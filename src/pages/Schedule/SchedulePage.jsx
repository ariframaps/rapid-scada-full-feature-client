import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Label,
  Select,
  Button,
  List,
  ListItem,
  TextInput,
  ArrowLeftIcon,
} from "flowbite-react";
import Loading from "../../components/Loading";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";

const SchedulePage = () => {
  const navigate = useNavigate();

  const { isLoggedIn, setLoggedOut } = useAuth();
  const [gatesData, setGatesData] = useState();
  const [scheduleList, setScheduleList] = useState();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // form value
  const [selectedGate, setSelectedGate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedValue, setSelectedValue] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) setLoggedOut();

    async function fetchData() {
      try {
        const [res1, res2] = await Promise.all([
          fetch(`/api/api/scada/getChannels`, { credentials: "include" }),
          fetch(`/api/api/schedule`, { credentials: "include" }),
        ]);

        if (
          res1.status === 401 ||
          res1.status === 403 ||
          res2.status === 401 ||
          res2.status === 403
        ) {
          await setLoggedOut();
          return;
        }

        const data1 = await res1.json();
        const data2 = await res2.json();

        setGatesData(data1.gates);
        setScheduleList(data2.schedules);
      } catch (err) {
        setGatesData(null);
        setScheduleList(null);
        console.error("Fetch error");
      }
    }

    fetchData();
  }, []);

  async function handleAddSchedule(e) {
    e.preventDefault();

    if (
      !e.target.gates.value ||
      !e.target.time.value ||
      e.target.time.value == "" ||
      !e.target.value.value
    ) {
      setErrorMessage("Semua field harus diisi dengan benar!");
      return;
    }

    if (e.target.value.value < 0 || e.target.value.value > 100) {
      setErrorMessage("Persentase harus antara 0% sampai 100%");
      return;
    }

    // cek apakah gate ada
    const channelNum = gatesData.find(
      (gate) => gate.id.toString() === e.target.gates.value.toString()
    );

    // cek apakah jadwal sudah adad
    const findSameSchedule = scheduleList.find(
      (schedule) =>
        schedule.gate_id.toString() === e.target.gates.value &&
        schedule.scheduled_time.toString() === e.target.time.value + ":00"
    );
    if (findSameSchedule) {
      setErrorMessage(
        `Jadwal pukul ${e.target.time.value} pada ${channelNum.channel_name} sudah ada. Ganti waktu atau hapus jadwal yang sudah ada!`
      );
      return;
    }

    // jika ada gate dan tidak ada yang sama maka
    if (channelNum) {
      setIsLoading(true);
      console.log({
        gate_id: e.target.gates.value,
        value: e.target.value.value,
        scheduled_time: e.target.time.value,
        channel_name: channelNum.channel_number,
      });
      try {
        const res = await fetch("/api/api/schedule/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            gate_id: e.target.gates.value,
            value: e.target.value.value,
            scheduled_time: e.target.time.value,
            channel_number: channelNum.channel_number,
          }),
        });
        //   gate_id, value, scheduled_time, channelNum

        if (res.status == 401 || res.status == 403) {
          alert("Sesi telah habis, silahkan login kembali");
          await setLoggedOut();
          return;
        }

        const data = res.json();
        const newSchedule = {
          id: data.newId,
          gate_id: e.target.gates.value,
          cnl: channelNum.channel_number,
          scheduled_time: e.target.time.value + ":00",
          value: e.target.value.value,
        };
        setScheduleList([...scheduleList, newSchedule]);

        console.log("Berhasil menambah jadwal baru");
        setIsLoading(false);
      } catch (err) {
        console.error("Gagal menambah jadwal baru");
        setErrorMessage("Gagal menambah jadwal baru, silahkan coba lagi.");
        setIsLoading(false);
        alert(`Gagal menyimpan perubahan`);
      }
    } else {
      setErrorMessage("Embung tidak ditemukan!");
      return;
    }
  }

  async function handleDeleteSchedule(scheduleId) {
    const findGate = scheduleList.find(
      (schedule) => schedule.id.toString() === scheduleId.toString()
    );

    if (findGate) {
      try {
        const res = await fetch(`/api/api/schedule/${scheduleId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (res.status == 401 || res.status == 403) {
          alert("Sesi telah habis, silahkan login kembali");
          await setLoggedOut();
          return;
        }

        setScheduleList(
          scheduleList.filter(
            (schedule) => schedule.id.toString() !== scheduleId.toString()
          )
        );
      } catch (error) {
        setErrorMessage("Gagal menghapus jadwal");
        return;
      }
    } else {
      setErrorMessage("Jadwal tidak ditemukan!");
      return;
    }
  }

  return (
    <div className="max-w-xl mx-auto my-3 sm:my- px-4 sm:px-2">
      <Button
        onClick={() => navigate(-1)}
        className="cursor-pointer mb-5 sm:mb-10"
        color={"alternative"}>
        <ArrowLeftIcon />
      </Button>
      {/* form */}
      <div>
        <form
          onSubmit={handleAddSchedule}
          className="text-start flex flex-col sm:flex-row justify-between gap-10 gap-y-3 p-3 sm:p-5 rounded-lg bg-slate-100">
          <div className="flex justify-between flex-1">
            <div className="w-max min-w-24 sm:min-w-32">
              <div className="mb-2 block">
                <Label htmlFor="countries">Embung</Label>
              </div>
              <Select
                id="gates"
                value={selectedGate}
                onChange={(e) => setSelectedGate(e.target.value)}
                required>
                <option value="" hidden>
                  Pilih
                </option>
                {gatesData &&
                  gatesData.map((gate) => (
                    <option key={gate.id} value={gate.id}>
                      {gate.channel_name}
                    </option>
                  ))}
              </Select>
            </div>
            <div className="max-w-[7rem]">
              <div className="mb-2 block">
                <Label htmlFor="value">Pilih Jam:</Label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="time"
                  id="time"
                  className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  //   min="09:00"
                  //   max="18:00"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="w-min min-w-14 sm:min-w-24">
              <div className="mb-2 block">
                <Label htmlFor="value">Buka %</Label>
              </div>
              <div className="flex items-center gap-2">
                <TextInput
                  id="value"
                  type="number"
                  placeholder="10"
                  value={selectedValue}
                  onChange={(e) => setSelectedValue(e.target.value)}
                  required
                  //   className="w-20"
                />
                <span className="hidden sm:inline font-bold text-lg">%</span>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-min">
            <div className="mb-2 hidden sm:block">
              <Label htmlFor="value">Buat</Label>
            </div>
            <Button disabled={isLoading} type="submit" className="w-full">
              {isLoading ? <Loading size={5} /> : "Buat"}
            </Button>
          </div>
        </form>
        {errorMessage && (
          <div className="bg-red-300 rounded-b py-1 sm:-mt-2">
            <p className="text-sm text-red-900 px-[7vw] py-1">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* list */}
      <List
        unstyled
        className="p-3 sm:p-5 flex flex-col gap-2 divide-y divide-gray-200 bg-slate-100 mt-5 sm:mt-5 rounded">
        {scheduleList && scheduleList.length != 0 ? (
          scheduleList.map((schedule, index) => {
            const findGate = gatesData.find(
              (gate) => gate.id.toString() === schedule.gate_id.toString()
            );

            if (findGate) {
              return (
                <ListItem
                  key={index}
                  className="w-full bg-white gap-2 sm:gap-10 flex justify-between rounded-lg font overflow-hidden shadow-xsh-max">
                  <div className="grid grid-cols-3 items-center py-3 px-1 w-full justify-between  text-sm sm:text-base">
                    <div className="border-r border-slate-200">
                      <p className="font-bold sm:text-lg">
                        {findGate.channel_name}
                      </p>
                    </div>
                    <div className="border-r border-slate-200">
                      <p>{schedule.scheduled_time.slice(0, 5)} AM</p>
                    </div>
                    <div className="border-r border-slate-200">
                      <p>{schedule.value}%</p>
                    </div>
                  </div>
                  <div className="min-h-full bg-green-200">
                    <ConfirmModal
                      btnClassName={
                        "rounded-none bg-red-600 text-white px-3 hover:bg-red-800 text-sm h-full text-xs"
                      }
                      btnText={"Hapus"}
                      text={"Apakah anda yakin ingin menghapus jadwal ini?"}
                      setAnswer={() => handleDeleteSchedule(schedule.id)}
                    />
                  </div>
                  {/* <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className={
                      "rounded-none bg-red-600 text-white px-3 hover:bg-red-800 text-sm"
                    }>
                    Hapus
                  </button> */}
                </ListItem>
              );
            } else {
              return <p>Data {schedule.id} tidak ditemukan</p>;
            }
          })
        ) : (
          <p>Tidak ada data untuk ditampilkan</p>
        )}
      </List>
    </div>
  );
};

export default SchedulePage;
