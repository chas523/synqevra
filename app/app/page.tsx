export default function Home() {
  return (
    <div className="flex justify-center items-center p-2">
      <div className="w-1/2 rounded bg-white p-6 shadow mb-12 text-black">
        <h2 className="text-center">Send events to ThingsBoard!</h2>
        <div className="mt-4 flex flex-col items-center justify-center text-center space-y-2">
          <p>
            Please remember - site is prepared for hosting ThingsBoard and
            Django on the same machine
          </p>
          <p>
            <b>
              If you want to use it elsewhere, please adjust the IP addresses
              and port numbers
            </b>
          </p>
        </div>
      </div>
    </div>
  );
}
