import MqttForm from "@/components/mqtt-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostForm from "@/components/post-form";

export default function Client() {
  return (
    <main>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Tabs defaultValue="mqtt">
          <TabsList>
            <TabsTrigger value="mqtt">MQTT</TabsTrigger>
            <TabsTrigger value="post">POST</TabsTrigger>
          </TabsList>
          <TabsContent value="mqtt">
            <MqttForm />
          </TabsContent>{" "}
          <TabsContent value="post">
            <PostForm />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
